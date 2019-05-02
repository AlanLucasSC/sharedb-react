import {firebaseDatabase} from '../utils/firebaseUtils'

export default class FirebaseService {

    static getOneData = async (path, id, limit = 10) => {
        const query = firebaseDatabase.ref(path).child(id).limitToLast(limit)
        const snapshot = await query.once('value')
        const value = snapshot.val()

        return value
    }
    static getAllData = async(path) =>{
        const query = firebaseDatabase.ref(path).orderByChild('title')

        const snapshot = await query.once('value')

        const value = snapshot.val()

        return value
    }

    static listenIfChildAdded = (path, id, callback) => {
        const query = firebaseDatabase.ref(path).child(id)

        query.on("child_added", callback);
    }

    static getDocument = async (id) => {
        
        const pathOfCollectionDocuments = 'documents'
        const document = await this.getOneData(pathOfCollectionDocuments, id)

        return document
    };
    
    static getTemplates = async () => {
        
        const pathOfCollectionDocuments = 'templates'
        const documents = await this.getAllData(pathOfCollectionDocuments)

        return documents
    };

    static updateDocument = async (idDocument, document, userName) => {
        var pathOfCollectionDocuments = 'documents'
        console.log(idDocument, document, userName)
        try {
            
            var collectionDocuments = firebaseDatabase.ref(pathOfCollectionDocuments)
            var documentRef = collectionDocuments.child(idDocument)
            var newDocument = documentRef.push()

            newDocument.set({
                content: document,
                created: new Date().toISOString(),
                user: userName
            })
        } catch (error) {
            return false
        }

        return true
    }

    static insertTemplate = async(titulo, descricao, conteudo) => {
        var pathOfCollectionTemplates = 'templates'

        try{
            var collectionTemplates = firebaseDatabase.ref(pathOfCollectionTemplates)
            var documentRef = collectionTemplates.push();

            documentRef.set({
                title:titulo,
                description:descricao,
                content:conteudo
            })

        }catch(error){
            console.log(error)
        }
    }
    static insertHistory = async (idHistory, differences) => {
        var pathOfCollectionHistories = 'histories'
        try {

            var collectionHistories = firebaseDatabase.ref().child(pathOfCollectionHistories)
            var historyRef = collectionHistories.child(idHistory)

            differences.forEach(difference => {
                //console.log(difference)
                let newHistory = historyRef.push()
                newHistory.set(difference)
            });

        } catch (error) {
            return false
        }
        return true
    }

}