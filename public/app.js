    const auth = firebase.auth();
    var db = firebase.firestore();

    const beforeLogin = document.getElementById('beforeLogin');
    const supportLogin = document.getElementById('supportLogin');
    const heading = document.getElementById('heading');
    
    const navbar = document.getElementById('navbar');

    var selectedPeer;
    var supportUserId = '1pU8PiVItiS9YI3TIuuxjFA9I3i2';
    var customerId = 'K2JDvIAQ17XcoV2quazAjdtBSl52';

    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const exportBtn = document.getElementById('exportBtn');
    const addBtn = document.getElementById('addBtn');
    const addUser = document.getElementById('addUser');

    const messageInput = document.getElementById('messageInput');

    var fileButton = document.getElementById('fileInput');

    const usersList = document.getElementById('usersList');

    signOutBtn.onclick = () => auth.signOut();

    var data;

    const createMessage = document.getElementById('createMessage');

    const chatMessages = document.getElementById('chat-messages');

    var currentUserType;

    var input = document.getElementById("msg");
    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            goMessage();
        }
    });

    let userRef;

    signInBtn.onclick = () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // console.log(`${email} ${password}`);
        user = firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            window.alert(errorMessage);
        });
        email.value = '';
        password.value = '';
    };

    addUser.onclick = () => {
        const name = document.getElementById('userNameInput').value;
        const email = document.getElementById('userEmailInput').value;
        const password = document.getElementById('userPasswordInput').value;

        if(name == '' || email == '' || password == '') {
            return alert('All fields required!');
        }

        auth.createUserWithEmailAndPassword(email, password).then(function(firebaseUser){
            console.log(firebaseUser);
            console.log(firebaseUser.user.uid);
            db.collection('users').doc(`${firebaseUser.user.uid}`).set({

                name:name,
                email:email,
                type:'support'

            });
        }).catch(err => alert(err.message));


    }

    function ValidateEmail(mail) 
    {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }


    firebase.auth().onAuthStateChanged(user => {
        if (user) {

            userRef = db.collection('users').doc(user.uid);

            userRef.get().then(function(doc) {
                if (doc.exists) {
                    if (doc.data()['type'] == 'support') {
                        currentUserType = 'support';
                        beforeLogin.hidden = true;
                        exportBtn.style.display = 'none';
                        addBtn.style.display = 'none';
                        supportLogin.hidden = false;
                        navbar.hidden = false;
                        heading.innerHTML = "Beacon Support"
                        getUsers(user);
                        
                    } else if( doc.data()['type'] == 'admin'){
                        currentUserType = 'admin';
                        beforeLogin.hidden = true;
                        supportLogin.hidden = false;
                        exportBtn.style.display = 'block';
                        addBtn.style.display = 'block';
                        messageInput.style.display = 'none';
                        navbar.hidden = false;
                        heading.innerHTML = "Beacon Admin"
                        // getAdminUsers();
                        getUsers(user);

                    }
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
        
        } else {
            beforeLogin.hidden = false;
            supportLogin.hidden = true;
            exportBtn.style.display = 'none';
            navbar.hidden = true;
        }
     });

     exportBtn.onclick = () => {
        if(data == undefined || data == []) return alert("nothing to export");
        var csv = "Chat";
        data.forEach(function(row) {
                csv += '\n'+row+',';
                
        });
     
       
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'chat.csv';
        hiddenElement.click();
     }


     function getAdminUsers(){

        $('#usersList').empty();
        // console.log(user.uid);
    
        db.collection('messages').where('').get().then(function(querySnapshot) {
            console.log(querySnapshot);
            querySnapshot.forEach(doc => console.log(doc.data()));
            // querySnapshot.forEach(function(doc) {
            //     console.log(doc.id);
            //     if (doc.data()['type'] == 'admin' || doc.id == user.uid) return;
             
            //     var html = `
            //         <li class="active lighten-3 p-2" onclick="listenForMessages('${doc.id}')">
            //           <a href="#"  class="d-flex justify-content-between"  >
            //             <div class="text-small">
            //               <strong>${doc.data()['name']}</strong>
            //               <p class="last-message text-muted">${doc.data()['email']}</p>
            //             </div>
            //           </a>
            //         </li>
            //     `;
    
            //     $('#usersList').append(html);
            //     // doc.data() is never undefined for query doc snapshots
            //     // console.log(doc.id, " => ", doc.data());
            // });
            
        });

     }

    
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    function getUsers(user){
        $('#usersList').empty();
        // console.log(user.uid);
    
        db.collection("users").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {

                if (doc.data()['type'] == 'admin' || doc.id == user.uid) return;
                if (doc.data()['type'] == 'support' || doc.id == user.uid) return;
             
                var html = `
                    <li class="active lighten-3 p-2" onclick="listenForMessages('${doc.id}')">
                      <a href="#"  class="d-flex justify-content-between"  >
                        <div class="text-small">
                          <strong>${doc.data()['name']}</strong>
                          <p class="last-message text-muted">${doc.data()['email']}</p>
                        </div>
                      </a>
                    </li>
                `;
    
                $('#usersList').append(html);
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());
            });
        });
    
    }

    

    
function listenForMessages(peer){
    selectedPeer = peer;
    let messagesRef;
    let unsubscribe;
    data = [];
    auth.onAuthStateChanged(user => {
        if (user) {
                var usersRef = db.collection('users');
                var userType;
                usersRef.doc(`${user.uid}`).get().then((documentSnapshot)=>{
                    userType = documentSnapshot.data()['type'];
                    // console.log(userType);
                });
                if (userType == 'support') {
                    usersRef.doc(`${user.uid}`).update({
                        chatingWith:peer
                    });
                    
                }
                
                // console.log(peer);
                // console.log(currentUserType);
                if (currentUserType == 'admin') {
                    messagesRef = db.collection('messages').doc(`${supportUserId}-${peer}`);
                    unsubscribe = messagesRef
                                .collection('chat')
                                .orderBy('createdAt')
                                .onSnapshot(querySnapshot => {
                                    if(querySnapshot.docs.length == 0) return alert("User has no conversation");
                                    const messages = querySnapshot.docs.map(doc => {
                                        data.push(doc.data()['message']);
                                        
                                        return buildAdminMessage(doc, supportUserId);
                                    });
                                    chatMessages.innerHTML = messages.join('');
                                    document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight;
                            });

                } else {
                    messagesRef = db.collection('messages').doc(`${user.uid}-${peer}`);    
                    unsubscribe = messagesRef
                                .collection('chat')
                                .orderBy('createdAt')
                                .onSnapshot(querySnapshot => {
                                    
                                    const messages = querySnapshot.docs.map(doc => {
                                        data.push(doc.data()['message']);
                                        return buildMessage(doc, user);
                                    });
                                    chatMessages.innerHTML = messages.join('');
                                    document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight;
                            });
                }
                
            
        } else {
            unsubscribe && unsubscribe();
        }
        // console.log(data);
    
    });
}

function buildAdminMessage(doc, user){
    var body;
    if (doc.data()['type'] == 1) {

        body = `<li class="d-flex  mx-1 my-1" >
                    <div class="chat-body white p-3 d-flex justify-content-right z-depth-1">    
                    <p class="mb-0">
                        <img src="${doc.data()['message']}" alt="thumbnail" class="img-thumbnail"
                        style="width: 200px">
                    </p>
                    </div>
                </li>`;
        
    } else {

        if(doc.data()['sentFrom'] == user){
            body = `<li class="d-flex  mx-1 my-1" >
                        <div class="chat-body white p-3 d-flex justify-content-right z-depth-1">    
                        <p class="mb-0">
                            ${doc.data()['message']}
                        </p>
                        </div>
                    </li>`;
    } else {
            body = `<li class="d-flex justify-content-end mx-1 my-1" >
                        <div class="chat-body black p-3 z-depth-1">
                        <p class="mb-0 text-white">
                            ${doc.data()['message']}
                        </p>
                        </div>
                    </li>`;
    }
        
    }
    return body;

}

function buildMessage(doc, user){
    // console.log(user);
    var body;
    if (doc.data()['type'] == 1) {

        body = `<li class="d-flex  mx-1 my-1" >
                    <div class="chat-body white p-3 d-flex justify-content-right z-depth-1">    
                    <p class="mb-0">
                        <img src="${doc.data()['message']}" alt="thumbnail" class="img-thumbnail"
                        style="width: 200px">
                    </p>
                    </div>
                </li>`;
        
    } else {

        if(doc.data()['sentFrom'] == user.uid){
            body = `<li class="d-flex  mx-1 my-1" >
                        <div class="chat-body white p-3 d-flex justify-content-right z-depth-1">    
                        <p class="mb-0">
                            ${doc.data()['message']}
                        </p>
                        </div>
                    </li>`;
    } else {
            body = `<li class="d-flex justify-content-end mx-1 my-1" >
                        <div class="chat-body black p-3 z-depth-1">
                        <p class="mb-0 text-white">
                            ${doc.data()['message']}
                        </p>
                        </div>
                    </li>`;
    }
        
    }
    return body;

}

function goMessage(){
    const msg = document.getElementById('msg').value; 
    
    sendMessage(msg);
}

function sendMessage(msg, type = 0){
    let messagesRef;
    
    // const msg = document.getElementById('msg').value;
    if(msg == '' || msg == null) return alert('Type your message');
    if(selectedPeer == null || selectedPeer == undefined) return alert('Select the receiver first');
    auth.onAuthStateChanged(user => {
        if (user) {
                // console.log(selectedPeer);
                messagesRef = db.collection('messages').doc(`${user.uid}-${selectedPeer}`);
                const { serverTimestamp } = firebase.firestore.FieldValue;
                unsubscribe = messagesRef
                            .collection('chat')
                            .add({
                                message:msg,
                                createdAt: serverTimestamp(),
                                sentFrom:user.uid,
                                type: type
                            });

               
            document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight;
            
        } else {
            unsubscribe && unsubscribe();
        }
    
    });
    document.getElementById('msg').value = '';
}

$('#fileInput').change(function(e){
    if(selectedPeer == null || selectedPeer == undefined) return alert('Please select receiver first');

    // console.log('this run');

    var file = e.target.files[0];
    var storageRef = firebase.storage().ref(file.name);
    var task = storageRef.put(file);
    task.on('state_changed', function progress(snapshot) {
    }, function error(err) {
        alert(err);
    },function complete() {
        task.snapshot.ref.getDownloadURL().then(function(downloadURL) {

            // console.log('File available at', downloadURL);
            sendMessage(downloadURL, 1);
            
        });
    });
});

      
    
// console.log(firebase);
