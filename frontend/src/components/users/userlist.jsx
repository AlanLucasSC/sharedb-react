import React from 'react'

const UserList = (props) => {
    const users = props.users;
    const listItems = users.map((user, index) =>
        <h5 className="d-inline m-1" key={index}><span className="badge badge-secondary" style={{backgroundColor: user.color}} title={ user.name }> { user.name } </span></h5>
    );
    return (
        <div className="text-right p-1">{listItems}</div>
    );
}

export default UserList;