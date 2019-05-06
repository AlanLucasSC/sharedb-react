import React, {Component} from 'react';
import sharedb from 'sharedb/lib/client';
import ReactQuill, { Quill } from  'react-quill'
import { w3cwebsocket as W3CWebSocket  } from 'websocket';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';
import richText from 'rich-text';
import mammoth from 'mammoth';
import socket from '../utils/socket'


import Snackbar from './snackbar'
import History from './history/history'
import Template from './template/template'
import ChatWidget from './chat/chat'
import UserList from './users/userlist'

import { applySaveButton, applyHistoryButton, applyTemplateButton, applyUploadTemplateButton } from './buttonInHtml'
import { getUserData } from '../utils/document'
import FirebaseService from '../services/firebaseService'

class Editor extends Component{
    constructor(props){
        super(props)

        this.quillReference = React.createRef();
        this.snackbarRef = React.createRef();
        var userData = getUserData()

        Quill.register('modules/cursors', QuillCursors);
        this.state = { 
            text: '', 
            quill: null,
            cursors: null,
            user: userData,
            documentId: userData.documentId,
            quillWidth: 100,
            historyIsVisible: false,
            templateIsVisible: false,
            color: '',
            users: [],
            isUpdateUser: null
        }

        sharedb.types.register(richText.type)
        
        this.socket  = new W3CWebSocket('ws://10.2.183.146:8081');

        this.connection = new sharedb.Connection(this.socket);
        this.document = this.connection.get('examples', 'richtext');
        
        window.disconnect = function(){
            this.connection.close();
        }

        window.connect = function(){
            this.socket = new W3CWebSocket('ws://10.2.183.146:8081');
            this.connection.bindToSocket(this.socket);
        }

        this.InitEditor = this.InitEditor.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.applyCustomToolbar = this.applyCustomToolbar.bind(this)
        this.saveDocument = this.saveDocument.bind(this)
        this.openHistory = this.openHistory.bind(this)
        this.openTemplate = this.openTemplate.bind(this)
        this.setContent = this.setContent.bind(this)

        //upload docx
        this.handleFile = this.handleFile.bind(this)
        this.convertToHtml = this.convertToHtml.bind(this)
        this.setRawContent = this.setRawContent.bind(this)

        //control users
        this.newUserConnect = this.newUserConnect.bind(this)
        this.addOldUsers = this.addOldUsers.bind(this)
        this.removeUser = this.removeUser.bind(this)

        //cursor quill
        this.selectionChange = this.selectionChange.bind(this)
        this.updateSelection = this.updateSelection.bind(this)

        //websockets functions
        this.document.subscribe(this.InitEditor)
        this.document.on('op', this.handleUpdate)

        //Socket.io functions
        socket.emit('user connect', {
            user: this.state.user.name,
            docId: this.state.documentId,
            color: this.state.color
        })
        socket.on('new user', this.newUserConnect)
        socket.on('users on room', this.addOldUsers)
        socket.on('user disconnected', this.removeUser)
        socket.on('selection change', this.updateSelection)
        
        
        this.toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction

            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [ 'link', 'image', 'video', 'formula' ],          // add's image support
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],

            ['save', 'history', 'template', 'upload-template'],
        ]
    }

    removeUser(user){
        var firstElement = 0
        var localUsers = this.state.users
        var newUsers = localUsers.filter( (localUser) => localUser.name !== user.name )
        var deleteUser = localUsers.filter( (localUser) => localUser.name === user.name )
        this.state.cursors.removeCursor(deleteUser[firstElement].id)

        this.setState({
          users: newUsers
        })
    }
    
    addOldUsers(users){
        if(this.state.isUpdateUser === null){
            var localUsers = this.state.users
            users.forEach(user => {
                user.id = localUsers.length
                localUsers.push(user)
                this.state.cursors.createCursor(user.id, user.name, user.color);
            })
            this.setState({
                users: localUsers,
                isUpdateUser:1
            })
        }
    }

    newUserConnect(user){
        var users = this.state.users
        var toUser = user.clientId

        socket.emit('others users on room', {
            users,
            toUser,
        })
        
        user.id = users.length
        users.push(user)
        this.state.cursors.createCursor(user.id, user.name, user.color);

        this.setState({
            users: users,
            color: user.color
        })
    }

    handleFile = (e) =>{
        var file = e.target.files[0]
        var reader = new FileReader()

        reader.onload = this.convertToHtml
        
        reader.readAsArrayBuffer(file)
    }

    convertToHtml = (e) => {
        mammoth.extractRawText({arrayBuffer: e.target.result})
            .then( this.setRawContent )
    }

    async setRawContent(content){
        const quillReference = this.quillReference.current.getEditor()
        quillReference.setText(content.value, 'user')
    }

    async setContent(delta){
        const quillReference = this.quillReference.current.getEditor()
        quillReference.setContents(delta, 'user')
    }

    async saveDocument(quill){
        var content = quill.root.innerHTML
        this.snackbarRef.current.openSnackBar('Salvando alterações...');
        var isUpdated = await FirebaseService.updateDocument(this.state.user.documentId, content, this.state.user.name)
        if(isUpdated === true){
            setTimeout(() => {
                this.snackbarRef.current.openSnackBar('Salvado com sucesso');
            }, 3100);
        } else {
            setTimeout(() => {
                this.snackbarRef.current.openSnackBar('Algo de errado aconteceu');
            }, 3100);
        }
    }

    async openHistory(){
        if(this.state.templateIsVisible){
            this.setState((prev) => ({
                historyIsVisible: !prev.historyIsVisible,
                templateIsVisible: !prev.templateIsVisible
            }))
            return null
        }
        this.setState((prev) => ({
            quillWidth: !prev.historyIsVisible ? 60 : 100,
            historyIsVisible: !prev.historyIsVisible
        }))
    }

    async openTemplate(){
        if(this.state.historyIsVisible){
            this.setState((prev) => ({
                historyIsVisible: !prev.historyIsVisible,
                templateIsVisible: !prev.templateIsVisible
            }))
            return null
        }
        this.setState((prev) => ({
            quillWidth: !prev.templateIsVisible ? 60 : 100,
            templateIsVisible: !prev.templateIsVisible
        }))
    }

    handleChange(value, delta, source){
        if (source !== 'user') return;
        this.document.submitOp(delta, {source: this.state.quill});
    }

    applyCustomToolbar(quill){
        applySaveButton(this.saveDocument, quill)
        applyHistoryButton(this.openHistory)
        applyTemplateButton(this.openTemplate)
        applyUploadTemplateButton(() => {
            document.querySelector('#upload-document-docx').click()
        })
    }

    componentDidMount(){  
        const quillReference = this.quillReference.current.getEditor()
        this.applyCustomToolbar(quillReference)
        const cursors = quillReference.getModule('cursors');
        this.setState({
            quill: quillReference,
            cursors: cursors
        })
    }

    selectionChange(range, source){
        socket.emit('selection change', {
            user: this.state.user.name,
            docId: this.state.documentId,
            range: range
        })
    }

    updateSelection(change){
        var user = change.user
        var range = change.range
        var users = this.state.users
        var firstElement = 0

        users = users.filter( (localUser) => localUser.name === user )
        user = users[firstElement]

        this.state.cursors.moveCursor(user.id, range);
    }

    InitEditor(err){
        if (err) throw err;
        this.state.quill.setContents(this.document.data)
    }

    handleUpdate(op, source){
        if (source === this.state.quill) return;
        this.state.quill.updateContents(op);
    }

    render(){
        return(
            <div>
                <UserList users={ this.state.users }/>
                <div className="d-flex">
                    <ReactQuill 
                        ref = { this.quillReference }
                        theme="snow"
                        modules = {{
                            cursors: true,
                            toolbar: this.toolbarOptions
                        }}
                        style= {{
                            width: `${this.state.quillWidth}%`
                        }}
                        onChange = {this.handleChange}
                        onChangeSelection={ this.selectionChange }
                    />
                    <History documentId={ this.state.documentId } isVisible={ this.state.historyIsVisible } limit={ 6 }/>
                    <Snackbar ref={ this.snackbarRef } />
                    <Template isVisible={ this.state.templateIsVisible } setContent={ this.setContent }/>
                    <input onChange={ this.handleFile } className="d-none" type="file" name="" id="upload-document-docx"/>
                </div>
                <ChatWidget id={ this.state.documentId }/>
            </div>
        )
    }
}
export default Editor;