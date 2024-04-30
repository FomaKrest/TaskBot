import User from "../models/user.js"


const addUser = (userId:string) => {
  User
    .exists({id: userId})
    .then((user) => {
      if (user == null) {

        const newUser = new User({
          id: userId,
        });
      
        newUser
            .save()
            .then((result) => {
                return result
            })
            .catch( (err) => { return err } );
      }
    })
    .catch( (err) => { return err } );
}

const getUserById = (userId: string, callback: Function) => {
  User
    .find({id: userId})
    .then( (result) => {
      callback(result);
    } )
    .catch( (err) => {
      console.log(err);
      callback([]);
    } );
}


export {
  addUser,
  getUserById,
}