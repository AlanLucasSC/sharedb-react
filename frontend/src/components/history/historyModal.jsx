import React from 'react'
import ReactHtmlParser from 'react-html-parser'

import { Modal } from '../modal/modal'
import diff from '../../utils/htmldiff'

import { isoDateToLocaleDate } from '../../utils/document'

const HistoryModal = (props) => {
    const listModal = props.documents.map(( document, index, documents ) => {
        const existDocument = ( documents, index ) => {
            return documents.length > index + 1
        }

        let date = isoDateToLocaleDate( document.created )
        let currentDocument = document.content
        let previousDocument = existDocument( documents, index + 1 ) ? documents[ index + 1 ].content : ''
        let mergedText = diff( previousDocument, currentDocument)

        return (
            <Modal key={ index } id={ 'modal'+index } title={ date }>
                { ReactHtmlParser( mergedText ) }
            </Modal>
        )
    })

    return (
        <div>
            { listModal }
        </div>
    )
}

export default HistoryModal