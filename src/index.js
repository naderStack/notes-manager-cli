let command = process.argv[2]
let note = process.argv[3]

// check if user type commands or not 
// if (!command || !note){
//     console.log('nothing')
//     process.exit(1)
// }


//init database
import path, { dirname, join } from 'path'
import url, { fileURLToPath } from 'url'

// console.log(import.meta.url) // file:///home/nader/Desktop/cli-notes-taker/src/index.js
// console.log(fileURLToPath(import.meta.url))     // /home/nader/Desktop/cli-notes-taker/src/index.js

let __dirname= dirname(fileURLToPath(import.meta.url))       // /home/nader/Desktop/cli-notes-taker/src

import sqlite3 from 'sqlite3'

import Table from 'cli-table3'


let db = new sqlite3.Database(join(__dirname,'database.db'))

 db.exec(`create table if not exists notes (id  integer primary key autoincrement , name text )`)

switch (command) {
    case 'add':

            db.run(`insert into notes (name) values (? )`, note)

            console.log(`done added  : ${note}`)
            
            
        break;

case 'list':
    db.all('select * from notes', [], (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        
        const table = new Table({
            head: ['ID', 'Name'],
            colWidths: [5, 50]
        });
        
        data.forEach(row => {
            table.push([row.id, row.name]);
        });
        
        console.log(table.toString());
    })
    break;
// case 'list':
//     db.all('select * from notes', [], (err, data) => {
//         if (err) {
//             console.error(err);
//             return;
//         }
//         console.table(data);
//     })
//     break;

   case 'delete':
           if (note){
                if (!isNaN(note)) {
                    db.run(`delete from notes where id=? `, note,function (err) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(`deleted ${this.changes} note `)
                        }
                    })
                    
                } else {
                    console.log("enter id look like 4 ")
                }
           } else {
            console.log(`enter number id of a note `)
           }
           
        break;



    default:
        console.log('a command not found')
        break;
}
