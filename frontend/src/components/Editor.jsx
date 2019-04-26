import React, {Component} from 'react';
import sharedb from 'sharedb/lib/client';
import { w3cwebsocket as W3CWebSocket  } from 'websocket';
import ReactQuill from 'react-quill';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';

var richText = require('rich-text');

class Editor extends Component{
    constructor(props){
        super(props)
        this.quillReference = React.createRef();

        this.state = { text: '', quill:null }

        sharedb.types.register(richText.type)
        
        this.socket  = new W3CWebSocket('ws://172.19.16.126:8080');

        this.connection = new sharedb.Connection(this.socket);
        this.document = this.connection.get('examples', 'richtext');

        window.disconnect = function(){
            this.connection.close();
        }

        window.connect = function(){
            this.socket = new W3CWebSocket('ws://172.19.16.126:8080');
            this.connection.bindToSocket(this.socket);
        }

        this.InitEditor = this.InitEditor.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)

        
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
            [{ 'align': [] }]
        ]
    }

    handleChange(value, delta, source){
        if (source !== 'user') return;
        this.document.submitOp(delta, {source: this.state.quill});
    }

    componentDidMount(){
        this.setState({
            quill : this.quillReference.current.getEditor()
        })
        this.state.quill.register('modules/cursors', QuillCursors)
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
            <ReactQuill 
                ref = { this.quillReference }
                theme="snow"
                modules= {{
                    toolbar: this.toolbarOptions,
                    cursors: true
                }}
                value= { this.state.text }
                onChange = {this.handleChange}
            />
        )
    }
}
export default Editor;