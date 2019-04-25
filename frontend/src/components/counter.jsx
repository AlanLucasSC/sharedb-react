import React, { Component } from 'react'
import sharedb from 'sharedb/lib/client'
import { w3cwebsocket as W3CWebSocket  } from 'websocket'

export default class Counter extends Component {
    constructor(props){
        super(props)
        this.state = {
            clicks: 0
        }
        var socket = new W3CWebSocket('ws://localhost:8080')
        var connection = new sharedb.Connection(socket)
        this.document = connection.get('examples', 'counter');

        this.increment = this.increment.bind(this)
        this.updateClicks = this.updateClicks.bind(this)

        this.document.subscribe(this.updateClicks)
        this.document.on('op', this.updateClicks);
    }

    updateClicks(){
        this.setState({
            clicks: this.document.data.numClicks
        })
    }

    increment() {
        this.document.submitOp([{p: ['numClicks'], na: 1}]);
    }

    render(){
        return (
            <div style={{
                fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', 
                fontSize: `${36}px`
            }}>
                You clicked <span id="num-clicks"> { this.state.clicks } </span> times.
                <button style={{
                  fontSize: `${36}px`
                }} onClick={ this.increment }>+1</button>
            </div>
        )
    }
}