//grab our client with destructuring from the export in index.js
const {client, getAllUsers, createUser, updateUser,  getUserById, getAllPosts, updatePost, createPost,} = require('./index');

async function testDB() {
    try{
        console.log('Starting to test database...');
        
        //queries are promises, so we can await them
        console.log("Calling getAllUsers")
        const users = await getAllUsers();
        console.log("Result:", users);
    
        console.log("Calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
          name: "Newname Sogood",
          location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);
    

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
        });
        console.log("Result:", updatePostResult);

        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);

        
        console.log('Finished database tests!');

    }catch(error){
        console.error('Error testing database!');
        throw error;
    }
}

//calls a query that dropsTables
async function dropTables(){
    try{
        console.log('Starting to drop tables...');
        await client.query(`
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;        
        `);
        console.log('Finished dropping tables!');
    }catch(error)
    {
        console.error('Error dropping tables!');
       throw error; //pass the error to the function that calls dropTables
    }
}

async function createTables(){
    try{
        console.log('Starting to build tables...');

        await client.query(`   
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `);

        await client.query(`
        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `);
        console.log('Finished building tables!')
    }catch(error) {
        console.error('Error building tables!')
        throw error; //pass the error up to the function that calls createTables.
    }
}

//function to attempt to create users



async function createInitialUsers()
{
    try
    {
        console.log("Starting to create users...");

        const albert = await createUser({username: 'albert', password: 'bertie99', name:'al', location:'IL',});
        const sansdra = await createUser({username: 'sandra', password: '2sandy4me', name:'sandy', location:'WI',});
        const glamgal = await createUser({username: 'glamgal', password: 'soglam', name:'glamy', location:'NY',});

        //console.log(albert);
    }catch(error)
    {
        console.error("Error creating users!");
        throw error;
    }
}

async function rebuildDB() {
    try{
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    }catch(error) {
        throw error;
    }
}

//posts functions
async function createInitialPosts()
{
    try {
        const [albert, sandra, glamgal] = await getAllUsers();
    
        await createPost({
          authorId: albert.id,
          title: "First Post",
          content: "This is my first post. I hope I love writing blogs as much as I love writing them."
        });
    
        await createPost({
            authorId: sandra.id,
            title: "First Post",
            content: "This is Sandra's first post. I hope I love writing blogs as much as I love writing them."
          });

        await createPost({
            authorId: glamgal.id,
            title: "First Post",
            content: "Fashion is not my passion"
        });

      } catch (error) {
        throw error;
      }
}


rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());