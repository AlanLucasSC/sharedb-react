import React, {Component} from 'react';
import sharedb from 'sharedb/lib/client';
import ReactQuill, { Quill } from  'react-quill'
import { w3cwebsocket as W3CWebSocket  } from 'websocket';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';
import richText from 'rich-text';


import Snackbar from './snackbar'
import History from './history/history'

import { applySaveButton, applyHistoryButton } from './buttonInHtml'
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
            historyIsVisible: false
        }

        sharedb.types.register(richText.type)
        
        this.socket  = new W3CWebSocket('ws://localhost:8080');

        this.connection = new sharedb.Connection(this.socket);
        this.document = this.connection.get('examples', 'richtext');
        
        window.disconnect = function(){
            this.connection.close();
        }

        window.connect = function(){
            this.socket = new W3CWebSocket('ws://localhost:8080');
            this.connection.bindToSocket(this.socket);
        }

        this.InitEditor = this.InitEditor.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.selectionChange = this.selectionChange.bind(this)
        this.applyCustomToolbar = this.applyCustomToolbar.bind(this)
        this.saveDocument = this.saveDocument.bind(this)
        this.openHistory = this.openHistory.bind(this)

        
        this.document.subscribe(this.InitEditor)
        this.document.on('op', this.handleUpdate)
        
        
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

            ['save', 'history']
        ]
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
        this.setState((prev) => ({
            quillWidth: !prev.historyIsVisible ? 60 : 100,
            historyIsVisible: !prev.historyIsVisible
        }))
    }

    handleChange(value, delta, source){
        if (source !== 'user') return;
        this.document.submitOp(delta, {source: this.state.quill});
    }

    applyCustomToolbar(quill){
        applySaveButton(this.saveDocument, quill)
        applyHistoryButton(this.openHistory)
    }

    componentDidMount(){  
        const quillReference = this.quillReference.current.getEditor()
        this.applyCustomToolbar(quillReference)
        const cursors = quillReference.getModule('cursors');
        cursors.createCursor(1, this.state.user.name, 'blue');
        this.setState({
            quill: quillReference,
            cursors: cursors
        })
    }

    selectionChange(range, source){
        this.state.cursors.moveCursor(1, range);
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
                </div>
            </div>
        )
    }
}
export default Editor;