const {createConnection} = require('typeorm') ;
import {User} from "../entities/user"
import {Post} from "../entities/post"
import {Comment} from "../entities/comment"
async function main() {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '0000',
    database: 'bianat-app',
    entities: [User,Post,Comment],
    synchronize: true,
  });
  console.log('Connected to database 💜');
}
main().catch((err) => {
  console.error(err);
});