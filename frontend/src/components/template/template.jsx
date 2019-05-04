import React, { Component } from 'react'
import ReactHtmlParser from 'react-html-parser'

import FirebaseService from '../../services/firebaseService'
import { objectToArray } from '../../utils/document'
import TemplateCard from './templateCard'
import { Modal } from '../modal/modal'

export default class Template extends Component {
    constructor(props){
        super(props)
        this.state = {
            templates: []
        }

        this.getTemplates = this.getTemplates.bind(this)

        this.getTemplates()
    }

    getTemplates = async () => {
        var templates = await FirebaseService.getTemplates()
        templates = objectToArray( templates ? templates : [] )
        this.setState({
            templates: templates
        })
    }
    
    render(){
        if(!this.props.isVisible)
            return null
        
        const templates = this.state.templates.map(( templates, index ) => {
            return (
                <TemplateCard delta={ templates.delta } setContent={ this.props.setContent } key={ index } index={ index } title={ templates.title } description={ templates.description } content={ templates.content }/>
            )
        })

        const modalTemplates = this.state.templates.map(( templates, index ) => {
            return (
                <Modal key={ index } id={ 'modalTemplate'+index } title={ templates.title }>
                    { ReactHtmlParser(templates.content) }
                </Modal>
            )
        })

        return (
            <div>
                <div aria-live="polite" aria-atomic="true" style={{
                    position: 'relative',
                    display: 'inline'
                }}>
                    <div className='m-3' style={{
                        position: 'absolute', 
                    }}>
                        { templates }
                    </div>
                </div>
                { modalTemplates }
            </div>
        )
    }
}