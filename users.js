const users = [];
const rooms = {};

const joinUser = ({ id, data }) => {
    const { tenantId, meetingId, uuid } = data;
        if (!rooms.hasOwnProperty(tenantId)) {
            rooms[tenantId] = {};
        }
        if (!rooms[tenantId].hasOwnProperty(meetingId)) {
            rooms[tenantId][meetingId] = [];
        }
        rooms[tenantId][meetingId].push({socketId:id,userId:uuid,tenantId:tenantId,meetingId:meetingId});
}

const removeUser = ({id,data}) => {
    let { tenantId, meetingId } = data;
    if ( tenantId && meetingId ) {
        const findUser = rooms[tenantId][meetingId];
        const index = findUser.findIndex((user) => user.socketId === id); 
        if(index !== -1) {
            return findUser.splice(index, 1)[0];
        }
    }
}

const getUser = ({id, data}) => {
    let { tenantId, meetingId } = data;
    const findUser = rooms[tenantId][meetingId];
    if (findUser) {
        return findUser.find(ele=>ele.socketId == id);
    }
    return null;
}


const addUser = ({ id, name }) => {
    name = name.trim().toLowerCase();

    const existingUser = users.find((user) =>  user.name === name); 
    if(existingUser){
        return {error: 'Username is taken'}
    }
    const user = { id, name, messages:[],typing:false};
    users.push(user);
    return { user } 
} 


const getUsersInRoom = (room) => users;

module.exports = { addUser, removeUser, getUser, getUsersInRoom, joinUser };