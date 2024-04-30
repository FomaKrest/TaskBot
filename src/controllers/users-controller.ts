import User from "../models/user.js"


const addUser = (userId:string) => {
  User
    .countDocuments({id: userId})
    .then((count) => {
      if (count == 0) {

        const user = new User({
          id: userId,
        });
      
        user
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