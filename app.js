// // app.js - Arquivo principal da aplicação

// const express = require('express');
// const bodyParser = require('body-parser');
// const neo4j = require('neo4j-driver');
// const dotenv = require('dotenv');

// dotenv.config();

// // Configuração do Neo4j
// const driver = neo4j.driver(
//     process.env.NEO4J_URI || 'neo4j://localhost:7687',
//     neo4j.auth.basic(
//         process.env.NEO4J_USER || 'neo4j',
//         process.env.NEO4J_PASSWORD || 'password'
//     )
// );

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Verificar conexão com Neo4j
// const verifyConnection = async () => {
//     const session = driver.session();
//     try {
//         await session.run('RETURN 1');
//         console.log('Conexão com Neo4j estabelecida com sucesso!');
//     } catch (error) {
//         console.error('Erro ao conectar com Neo4j:', error);
//     } finally {
//         await session.close();
//     }
// };

// verifyConnection();

// // Rotas da API para usuários
// app.get('/api/users', async (req, res) => {
//     const session = driver.session();
//     try {
//         const result = await session.run('MATCH (u:User) RETURN u');
//         const users = result.records.map(record => {
//             const user = record.get('u').properties;
//             return {
//                 id: record.get('u').identity.toString(),
//                 ...user
//             };
//         });
//         res.json(users);
//     } catch (error) {
//         console.error('Erro ao buscar usuários:', error);
//         res.status(500).json({ error: 'Erro ao buscar usuários' });
//     } finally {
//         await session.close();
//     }
// });

// app.get('/api/users/:id', async (req, res) => {
//     const id = req.params.id;
//     const session = driver.session();
    
//     try {
//         const result = await session.run(
//             'MATCH (u:User) WHERE id(u) = $id RETURN u',
//             { id: neo4j.int(id) }
//         );
        
//         if (result.records.length === 0) {
//             return res.status(404).json({ error: 'Usuário não encontrado' });
//         }
        
//         const user = result.records[0].get('u').properties;
//         res.json({
//             id: result.records[0].get('u').identity.toString(),
//             ...user
//         });
//     } catch (error) {
//         console.error('Erro ao buscar usuário:', error);
//         res.status(500).json({ error: 'Erro ao buscar usuário' });
//     } finally {
//         await session.close();
//     }
// });

// app.post('/api/users', async (req, res) => {
//     const { name, email, age } = req.body;
    
//     if (!name || !email) {
//         return res.status(400).json({ error: 'Nome e email são obrigatórios' });
//     }
    
//     const session = driver.session();
//     try {
//         // Verificar se o email já existe
//         const checkResult = await session.run(
//             'MATCH (u:User {email: $email}) RETURN u',
//             { email }
//         );
        
//         if (checkResult.records.length > 0) {
//             return res.status(409).json({ error: 'Email já cadastrado' });
//         }
        
//         const result = await session.run(
//             'CREATE (u:User {name: $name, email: $email, age: $age, createdAt: datetime()}) RETURN u',
//             { name, email, age: neo4j.int(age || 0) }
//         );
        
//         const newUser = result.records[0].get('u').properties;
//         res.status(201).json({
//             id: result.records[0].get('u').identity.toString(),
//             ...newUser
//         });
//     } catch (error) {
//         console.error('Erro ao criar usuário:', error);
//         res.status(500).json({ error: 'Erro ao criar usuário' });
//     } finally {
//         await session.close();
//     }
// });

// app.put('/api/users/:id', async (req, res) => {
//     const id = req.params.id;
//     const { name, email, age } = req.body;
    
//     if (!name && !email && age === undefined) {
//         return res.status(400).json({ error: 'Pelo menos um campo para atualização é necessário' });
//     }
    
//     const session = driver.session();
//     try {
//         // Construir a query de atualização dinamicamente
//         let queryParts = [];
//         let params = { id: neo4j.int(id) };
        
//         if (name) {
//             queryParts.push('u.name = $name');
//             params.name = name;
//         }
        
//         if (email) {
//             queryParts.push('u.email = $email');
//             params.email = email;
//         }
        
//         if (age !== undefined) {
//             queryParts.push('u.age = $age');
//             params.age = neo4j.int(age);
//         }
        
//         queryParts.push('u.updatedAt = datetime()');
        
//         const query = `
//             MATCH (u:User)
//             WHERE id(u) = $id
//             SET ${queryParts.join(', ')}
//             RETURN u
//         `;
        
//         const result = await session.run(query, params);
        
//         if (result.records.length === 0) {
//             return res.status(404).json({ error: 'Usuário não encontrado' });
//         }
        
//         const updatedUser = result.records[0].get('u').properties;
//         res.json({
//             id: result.records[0].get('u').identity.toString(),
//             ...updatedUser
//         });
//     } catch (error) {
//         console.error('Erro ao atualizar usuário:', error);
//         res.status(500).json({ error: 'Erro ao atualizar usuário' });
//     } finally {
//         await session.close();
//     }
// });

// app.delete('/api/users/:id', async (req, res) => {
//     const id = req.params.id;
//     const session = driver.session();
    
//     try {
//         const result = await session.run(
//             'MATCH (u:User) WHERE id(u) = $id DELETE u RETURN count(u) as count',
//             { id: neo4j.int(id) }
//         );
        
//         const count = result.records[0].get('count').toInt();
        
//         if (count === 0) {
//             return res.status(404).json({ error: 'Usuário não encontrado' });
//         }
        
//         res.status(204).end();
//     } catch (error) {
//         console.error('Erro ao excluir usuário:', error);
//         res.status(500).json({ error: 'Erro ao excluir usuário' });
//     } finally {
//         await session.close();
//     }
// });

// // Encerrar conexão com Neo4j quando a aplicação for encerrada
// process.on('SIGINT', async () => {
//     await driver.close();
//     console.log('Conexão com Neo4j encerrada');
//     process.exit(0);
// });

// // Iniciar o servidor
// app.listen(port, () => {
//     console.log(`Servidor rodando na porta ${port}`);
// });

// module.exports = app;

// app.js - Arquivo principal da aplicação

const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');

dotenv.config();

// Configuração do Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI || 'neo4j://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
    )
);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Verificar conexão com Neo4j
const verifyConnection = async () => {
    const session = driver.session();
    try {
        await session.run('RETURN 1');
        console.log('Conexão com Neo4j estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar com Neo4j:', error);
    } finally {
        await session.close();
    }
};

verifyConnection();

// Rotas da API para usuários
app.get('/api/users', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run('MATCH (u:User) RETURN u');
        const users = result.records.map(record => {
            const user = record.get('u').properties;
            return {
                id: record.get('u').identity.toString(),
                ...user
            };
        });
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    } finally {
        await session.close();
    }
});

app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (u:User) WHERE id(u) = $id RETURN u',
            { id: neo4j.int(id) }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = result.records[0].get('u').properties;
        res.json({
            id: result.records[0].get('u').identity.toString(),
            ...user
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    } finally {
        await session.close();
    }
});

app.post('/api/users', async (req, res) => {
    const { name, email, age } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const session = driver.session();
    try {
        // Verificar se o email já existe
        const checkResult = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (checkResult.records.length > 0) {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }

        const result = await session.run(
            'CREATE (u:User {name: $name, email: $email, age: $age, createdAt: datetime()}) RETURN u',
            { name, email, age: neo4j.int(age || 0) }
        );

        const newUser = result.records[0].get('u').properties;
        res.status(201).json({
            id: result.records[0].get('u').identity.toString(),
            ...newUser
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    } finally {
        await session.close();
    }
});

app.put('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const { name, email, age } = req.body;

    if (!name && !email && age === undefined) {
        return res.status(400).json({ error: 'Pelo menos um campo para atualização é necessário' });
    }

    const session = driver.session();
    try {
        // Construir a query de atualização dinamicamente
        let queryParts = [];
        let params = { id: neo4j.int(id) };

        if (name) {
            queryParts.push('u.name = $name');
            params.name = name;
        }

        if (email) {
            queryParts.push('u.email = $email');
            params.email = email;
        }

        if (age !== undefined) {
            queryParts.push('u.age = $age');
            params.age = neo4j.int(age);
        }

        queryParts.push('u.updatedAt = datetime()');

        const query = `
            MATCH (u:User)
            WHERE id(u) = $id
            SET ${queryParts.join(', ')}
            RETURN u
        `;

        const result = await session.run(query, params);

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const updatedUser = result.records[0].get('u').properties;
        res.json({
            id: result.records[0].get('u').identity.toString(),
            ...updatedUser
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    } finally {
        await session.close();
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (u:User) WHERE id(u) = $id DELETE u RETURN count(u) as count',
            { id: neo4j.int(id) }
        );

        const count = result.records[0].get('count').toInt();

        if (count === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(204).end();
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    } finally {
        await session.close();
    }
});

// Rotas da API para Endereços
app.get('/api/addresses', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run('MATCH (a:Address) RETURN a');
        const addresses = result.records.map(record => {
            const address = record.get('a').properties;
            return {
                id: record.get('a').identity.toString(),
                ...address
            };
        });
        res.json(addresses);
    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        res.status(500).json({ error: 'Erro ao buscar endereços' });
    } finally {
        await session.close();
    }
});

app.get('/api/addresses/:id', async (req, res) => {
    const id = req.params.id;
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (a:Address) WHERE id(a) = $id RETURN a',
            { id: neo4j.int(id) }
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Endereço não encontrado' });
        }
        const address = result.records[0].get('a').properties;
        res.json({
            id: result.records[0].get('a').identity.toString(),
            ...address
        });
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        res.status(500).json({ error: 'Erro ao buscar endereço' });
    } finally {
        await session.close();
    }
});

app.post('/api/addresses', async (req, res) => {
    const { street, number, city, userId } = req.body;

    if (!street || !number || !city || !userId) {
        return res.status(400).json({ error: 'Rua, número, cidade e userId são obrigatórios' });
    }

    const session = driver.session();
    try {
        // Verificar se o usuário existe
        const userCheck = await session.run('MATCH (u:User) WHERE id(u) = $userId RETURN u', { userId: neo4j.int(userId) });
        if (userCheck.records.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const result = await session.run(
            'CREATE (a:Address {street: $street, number: $number, city: $city, createdAt: datetime()}) ' +
            'WITH a ' +
            'MATCH (u:User) WHERE id(u) = $userId ' +
            'CREATE (u)-[:LIVES_AT]->(a) ' +
            'RETURN a',
            { street, number, city, userId: neo4j.int(userId) }
        );

        const newAddress = result.records[0].get('a').properties;
        res.status(201).json({
            id: result.records[0].get('a').identity.toString(),
            ...newAddress
        });
    } catch (error) {
        console.error('Erro ao criar endereço:', error);
        res.status(500).json({ error: 'Erro ao criar endereço' });
    } finally {
        await session.close();
    }
});

app.put('/api/addresses/:id', async (req, res) => {
    const id = req.params.id;
    const { street, number, city } = req.body;

    if (!street && !number && !city) {
        return res.status(400).json({ error: 'Pelo menos um campo para atualização é necessário' });
    }

    const session = driver.session();
    try {
        let queryParts = [];
        let params = { id: neo4j.int(id) };

        if (street) {
            queryParts.push('a.street = $street');
            params.street = street;
        }

        if (number) {
            queryParts.push('a.number = $number');
            params.number = number;
        }

        if (city) {
            queryParts.push('a.city = $city');
            params.city = city;
        }

        queryParts.push('a.updatedAt = datetime()');

        const query = `
            MATCH (a:Address)
            WHERE id(a) = $id
            SET ${queryParts.join(', ')}
            RETURN a
        `;

        const result = await session.run(query, params);

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Endereço não encontrado' });
        }

        const updatedAddress = result.records[0].get('a').properties;
        res.json({
            id: result.records[0].get('a').identity.toString(),
            ...updatedAddress
        });
    } catch (error) {
        console.error('Erro ao atualizar endereço:', error);
        res.status(500).json({ error: 'Erro ao atualizar endereço' });
    } finally {
        await session.close();
    }
});

app.delete('/api/addresses/:id', async (req, res) => {
    const id = req.params.id;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (a:Address) WHERE id(a) = $id DETACH DELETE a RETURN count(a) as count',
            { id: neo4j.int(id) }
        );

        const count = result.records[0].get('count').toInt();

        if (count === 0) {
            return res.status(404).json({ error: 'Endereço não encontrado' });
        }

        res.status(204).end();
    } catch (error) {
        console.error('Erro ao excluir endereço:', error);
        res.status(500).json({ error: 'Erro ao excluir endereço' });
    } finally {
        await session.close();
    }
});

app.get('/api/addresses/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const session = driver.session();

    try {
        const result = await session.run(
            `
            MATCH (u:User)-[:LIVES_AT]->(a:Address) 
            WHERE id(u) = $userId 
            RETURN u, a
            `,
            { userId: neo4j.int(userId) }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Endereço não encontrado para o usuário' });
        }

        const userAddresses = result.records.map(record => {
            const user = record.get('u').properties;
            const address = record.get('a').properties;
            return {
                user: {
                    id: record.get('u').identity.toString(),
                    ...user
                },
                address: {
                    id: record.get('a').identity.toString(),
                    ...address
                }
            };
        });
        res.json(userAddresses);
    } catch (error) {
        console.error('Erro ao buscar endereços do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar endereços do usuário' });
    } finally {
        await session.close();
    }
});

// Encerrar conexão com Neo4j quando a aplicação for encerrada
process.on('SIGINT', async () => {
    await driver.close();
    console.log('Conexão com Neo4j encerrada');
    process.exit(0);
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;
