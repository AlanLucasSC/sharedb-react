import React from 'react'

const HistoryCard = (props) => {
    return (
        <div className="toast showing w-200" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <strong className="mr-auto">
                <a href={ "#modal" + props.index } data-toggle="modal">
                    { props.date }
                </a>
                </strong>
                <small className="text-muted m-2">Saved by: <strong>{ props.user }</strong></small>
            </div>
        </div>
    )
}

export default HistoryCard