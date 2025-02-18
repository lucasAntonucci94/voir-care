import { 
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

// import {createUser, updateUser, getUserProfileByEmail} from "../users/index.js";
// import {getFileMetadata, getFileUrl, uploadFile} from "../storage/index.js";

const auth = getAuth();

const AUTH_ERRORS_MESSAGES = {
    'auth/invalid-email': 'El email no tiene un formato correcto.',
    'auth/internal-error': 'Verifique los datos y vuelta a intentarlo',
    'auth/admin-restricted-operation': 'Verifique los datos y vuelta a intentarlo',
    'auth/user-not-found': 'El usuario no existe.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/missing-email': 'Debe ingresar el email, es obligatorio.',
    'auth/weak-password': 'Contraseña débil, debe tener al menos 6 caracteres.',
}

let userData = {
    id: null,
    email: null,
    displayName: null,
    firstName: null,
    lastName: null,
    photoURL: null,
    photoURLFile: null,
    photoMetadata: null,
    isAdmin: null,
}

if(localStorage.getItem('user')) {
    userData = JSON.parse(localStorage.getItem('user'));
}

onAuthStateChanged(auth, user => {
    if(user) {
        userData = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            photoURLFile: null,
            isAdmin: user.isAdmin,
        }
        loadProfileInfo(user);
    } else {
        userData = {
            id: null,
            email: null,
            displayName: null,
            photoURL: null,
            photoURLFile: null,
            isAdmin: null,
        }
    }

    localStorage.setItem('user', JSON.stringify(userData));
    notifyAll();
});

/**
 * Carga la data completa del perfil del usuario.
 *
 * @param {{email: string, photoURL: string}} user
 */
function loadProfileInfo(user) {
    
    // const promiseFile = getFileUrl(user.photoURL).then(url => {
    //     userData.photoURLFile = url;
    // });
    // const promiseProfile = getUserProfileByEmail(user.email).then(data => {
    //     userData.avatar = data.avatar;
    //     userData.firstName = data.firstName;
    //     userData.lastName = data.lastName;
    //     userData.isAdmin = data.isAdmin;
    // });
    // Promise.all([promiseFile, promiseProfile]).then(() => {
    //     notifyAll();
    // });
}

let observers = [];

/**
 * Agrega un callback como "observer" para ser notificado de los cambios del
 * estado de autenticación.
 * El callback va a recibir como argumento los datos del estado de
 * autenticación actual.
 *
 * @param {function} callback
 * @return {function} - Función para cancelar la suscripción.
 */
export function listenForAuthChanges(callback) {
    observers.push(callback);

    notify(callback);

    return () => {
        observers = observers.filter(observer => observer !== callback);
    }
}

/**
 * Notifica al observerCallback previamente registrado del estado de
 * autenticación.
 *
 * @param {function} observerCallback
 */
function notify(observerCallback) {
    observerCallback({...userData});
}

/**
 * Notifica a todos los observers del estado de autenticación.
 */
function notifyAll() {
    observers.forEach(obs => notify(obs));
}

/*
 |--------------------------------------------------------------------------
 | Funciones de autenticación
 |--------------------------------------------------------------------------
 */
/**
 * Intenta autenticar al usuario.
 * Si tiene éxito, retorna true.
 * De lo contrario, retorna un objeto con el código y mensaje de error.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{code: number, message: string}|boolean>}
 */
export async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
    } catch(err) {
        return {
            code: err.code,
            message: AUTH_ERRORS_MESSAGES[err.code] || err.message,
        }
    }
}

/**
 * Cierra la sesión de la autenticación.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
    await signOut(auth);
}

/**
 * Crea un usuario.
 *
 * @param {{email: string, password: string}}
 * @returns {Promise<void>}
 */
export async function doRegister(email, password) {
    try {
        const {user} = await createUserWithEmailAndPassword(auth, email, password);
        // await createUser(user.uid, {
        //     email: user.email,
        //     displayName: user.displayName,
        //     isAdmin: false,
        // });
        return true;
    } catch(err) {
        return {
            code: err.code,
            message: AUTH_ERRORS_MESSAGES[err.code] || err.message,
        }
    }
}

/**
 * Actualiza el perfil del usuario.
 *
 * @param {{displayName: string}} options
 * @returns {Promise<Object>}
 */
export async function doUpdateProfile({displayName, photo, firstName, lastName}) {
    try {
        const promises = []
        const profileData = {
            displayName,
            firstName,
            lastName,
        }
        
        // if(photo?.base64 != null) {
        //     const filePath = 'profile/' + userData.email + '.jpg';
        //     var response = await uploadFile(filePath, photo.base64, {
        //         customMetadata: {
        //             ...photo.dimensions
        //         }
        //     });
        //     profileData.photoURL = filePath;
        // }

        // promises.profile = updateProfile(auth.currentUser, profileData);
        // promises.user = updateUser(userData.id, {
        //     email: userData.email,
        //     displayName: profileData.displayName,
        //     firstName: profileData.firstName,
        //     lastName: profileData.lastName,
        //     avatar: {
        //         photoURL:profileData.photoURL || null,
        //         width:photo?.dimensions?.width || null,
        //         height:photo?.dimensions?.height || null,
        //     },
        //     photoURLFile: userData.photoURLFile || null,
        // })
        
        // await Promise.all(promises)
        // userData.displayName = displayName;
        
        // if(photo)
        //     userData.photoURL = profileData.photoURL;

        // notifyAll();
        // loadProfileInfo(userData)

        return {success:true, photoURLFile: userData.photoURLFile};
    } catch(err) {
        return {success:false, photoURLFile: null};
    }
}


// /**
//  * Obtiene la imagen de storage del usuario
//  *
//  * @param {{photoURL: string}} user
//  */
// export function getStorageImage(photoURL) {
//     return getFileUrl(photoURL).then(url => {
//         return url;
//     });
// }
