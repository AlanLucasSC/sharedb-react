import React from 'react'

const TemplateCard = (props) => {
    return (
        <div className="toast showing w-200" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <strong className="mr-auto">
                <a href={ "#modalTemplate" + props.index } data-toggle="modal">
                    { props.title }
                </a>
                </strong>
                <small className="text-muted m-2">
                    <strong>{ props.description }</strong>
                    <a href={ "#modalTemplate" + props.index } data-toggle="modal">
                        <span className="ml-1 badge badge-primary">ver</span>
                    </a>
                    <span onClick={ () => props.setContent(props.delta) } className="button ml-1 badge badge-primary">aplicar</span>
                </small>
            </div>
        </div>
    )
}

export default TemplateCard