let command = process.argv[2] // [ add , delete , list ]

 let  tag , value_tag , valueOption , sql 


// check if user type commands or not 
if (!command ){
    console.log('enter options')
    process.exit(1)
}


//init database
import path, { dirname, join } from 'path'
import url, { fileURLToPath } from 'url'
// [debug ]
// console.log(import.meta.url) // file:///home/nader/Desktop/cli-notes-taker/src/index.js
// console.log(fileURLToPath(import.meta.url))     // /home/nader/Desktop/cli-notes-taker/src/index.js

let __dirname= dirname(fileURLToPath(import.meta.url))       // /home/nader/Desktop/cli-notes-taker/src

import sqlite3 from 'sqlite3'

import Table from 'cli-table3'


let db = new sqlite3.Database(join(__dirname,'database.db'))

 db.exec(`create table if not exists notes (id  integer primary key autoincrement , name text , tags text , dateAt  timestamp default current_timestamp )`)

switch (command) {


    case 'add':
    // add a Note when typing <name Note > and < tag Name> [require]
  
       valueOption = process.argv[3]
        tag = process.argv[4] // [--tag]
        value_tag = process.argv[5]  // [ value tag]

    if (valueOption && tag=='--tag' && value_tag) {

        value_tag  = value_tag.split(",")

     sql = `insert into notes (name , tags ) values (?,?)`

        db.run(sql, [ valueOption ,  JSON.stringify( value_tag ) ]  )
        
    } else {
        console.log("type a tag for your note ")  // warning when add a note without tagname 
    }                   

        break;

case 'list':
        tag = process.argv[3]

        value_tag = process.argv[4]

            // show all Notes when dont use --tags
        if (!tag){
            sql = `select * from notes`;

            db.all(sql, [], (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    
                    const table = new Table({
                        head: ['ID', 'Name' , 'tags','create at'],
                        colWidths: [5, 30,20,30]
                    });
                    
                    data.forEach(row => {
                        table.push([row.id, row.name , row.tags , row.dateAt]);
                    });
                    
                    console.log(table.toString());
                })


        } 
        

        // show a note when type --tag <tagname> if it match [a note with tag ]
        if (tag == "--tag" && value_tag){

            sql = `select * from notes where tags like ?`

          db.all(sql,[`%${value_tag}%`], (err,row)=>{


             const tableTag = new Table({
                        head: ['ID', 'Name' , 'tags','create at'],
                        colWidths: [5, 30,20,30]
                    });
                    
                    row.forEach(r => {
                        tableTag.push([r.id, r.name , r.tags , r.dateAt]);
                    });
            
    
                    console.log(tableTag.toString());
          })

        }


      
    break;

   case 'delete':
     valueOption = process.argv[3]
           if (valueOption){
                if (!isNaN(valueOption)) {

                    sql = `delete from notes where id=? `
                    db.run(sql , valueOption,function (err) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(`deleted ${this.changes} notes `)
                        }
                    })
                    
                } else {
                    console.log("enter id look like 4 ")
                }
           } else {
            console.log(`enter number id of a note `)
           }
           
        break;

   case 'search':
    case 's':
            valueOption = process.argv[3]
           sql = `select * from notes where name like ?`
            db.all(sql,[`%${valueOption}%`],function (err , rows) {
                if (err) {
                    console.log(err)
                }

         const tableTag = new Table({
                        head: ['ID', 'Name' , 'tags','create at'],
                        colWidths: [5, 30,20,30]
                    });
                    
                    rows.forEach(r => {
                        tableTag.push([r.id, r.name , r.tags , r.dateAt]);
                    });
            
    
                    console.log(tableTag.toString());
            })

    
   break;

    default:
        console.log('a command not found')
        break;
}
