import React, { Component } from 'react'

import HistoryCard from './historyCard'

import FirebaseService from '../../services/firebaseService'
import { objectToArray, isoDateToLocaleDate } from '../../utils/document'
import HistoryModal from './historyModal'

export default class History extends Component {
    constructor(props){
        super(props)

        this.state = {
            documents: []
        }

        this.getDocument = this.getDocument.bind(this)
        setInterval(this.getDocument, 6000)
    }

    getDocument = async () => {
        var documents = await FirebaseService.getDocument( this.props.documentId )
        documents = objectToArray( documents ? documents : [] ).reverse()
        this.setState({
            documents: documents
        })
    }

    render(){
        if(!this.props.isVisible)
            return null
        
        const histories = this.state.documents.map(( document, index ) => {
            let date = isoDateToLocaleDate( document.created )
            return (
                <HistoryCard key={ index } index={ index } date={ date } user={ document.user }/>
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
                        { histories }
                    </div>
                </div>
                <HistoryModal documents={ this.state.documents }/>
            </div>
        )
    }
}