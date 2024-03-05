const express = require("express");
const app = express();

const exphbs = require("express-handlebars");
const { createConnection } = require("mysql2/promise");

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

app.use(express.static('public')); 

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json()) 

app.post("/books/alterar/confirmar", async(req, res) => {
    const nomeAntigo = req.body.nomeAntigo 
    const nome = req.body.nome
    const pag = req.body.pag

    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    try{
        const sql = `UPDATE book SET nome = '${nome}', pag = '${pag}' WHERE nome = '${nomeAntigo}'`
        await conn.execute(sql); 
    } catch (e) {
        console.log(e)
    } finally {  
        res.redirect(`/books/${nome}`)
    }
})

app.get("/books/deletar/:nome", async(req, res) => {
    const nome = req.params.nome
    
    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    const sql = `DELETE FROM book WHERE nome = '${nome}' `

    await conn.execute(sql)
     
    res.redirect("/books") 
})

app.get("/books/alterar/:nome", async(req, res) => {
    const nome = req.params.nome
    
    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    const sql = `SELECT pag, 
                   CASE 
                   WHEN pag = 1 THEN 'pagina' 
                  ELSE 'paginas' 
                 END AS pagtit
                   FROM book
                  WHERE nome = '${nome}' `

    let [row] = await conn.execute(sql)
    
    if(row.length == 0){ 
        res.redirect("/books")
    } else { 
        row = row[0]
        const nomeAntigo = nome
        res.render("alterar", { nome, row, nomeAntigo})
    } 
})

app.get("/books/:nome", async(req, res) => {
    const nome = req.params.nome

    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    const sql = `
            SELECT 
                *, 
                CASE 
                    WHEN pag = 1 THEN 'pagina' 
                    ELSE 'paginas' 
                END AS pagtit
            FROM 
                book
            WHERE nome = '${nome}'
        `;
    const [rows] = await conn.execute(sql)
    const row = rows[0]
    res.render("booksfiltroir", {row})
})

app.post("/books/insert", async (req, res) => {

    const nome = req.body.nome
    const pag = req.body.pag

    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    try {
        const query = `INSERT INTO book (nome, pag) VALUES (?, ?)`;
        await conn.execute(query, [nome, pag]);
        console.log('Cadastrado');
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
    } finally {
        await conn.end();
        res.redirect('/books')
    } 
    
})

app.post("/books/filtro", async(req, res) => { 
    const filtro = req.body.filtro

    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    try {
        const sql = `
            SELECT 
                *, 
                CASE 
                    WHEN pag = 1 THEN 'pagina' 
                    ELSE 'paginas' 
                END AS pagtit
            FROM 
                book
            WHERE nome LIKE '%${filtro}%'
        `;
        const [rows] = await conn.execute(sql)
        res.render('booksfiltro', { rows }) 
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
    } finally {
        await conn.end(); 
    } 
})

app.get("/books", async(req, res) => { 

    const conn = await createConnection({
        host: 'localhost',
        user: 'root',
        password: '9LGqai15',
        database: 'enzo'
    }); 

    try {
        const sql = `
            SELECT 
                *, 
                CASE 
                    WHEN pag = 1 THEN 'pagina' 
                    ELSE 'paginas' 
                END AS pagtit
            FROM 
                book
        `;
        let [rows] = await conn.execute(sql)

        let semRow = null
        if(rows.length == 0){
            semRow = "Sem livros cadastrados"
        }

        res.render('books', { rows, semRow })
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
    } finally {
        await conn.end(); 
    } 
})
 
app.get("/", async (req, res) => {
    res.render('home');
});
 
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

 