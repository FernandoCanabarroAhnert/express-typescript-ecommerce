# Projeto Back-End: API de E-commerce com Express e TypeScript

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-003B6F?style=for-the-badge&logo=postgresql&logoColor=white)
![PgAdmin](https://img.shields.io/badge/PgAdmin-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DC382D?style=for-the-badge&logo=Redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Testcontainers](https://img.shields.io/badge/Testcontainers-%2300BCD4?style=for-the-badge&logo=Docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

## O que é o projeto? 🤔

Este API permite o CRUD de categorias, marcas e produtos, e a visualização e criação de pedidos, e os endpoints de consulta permitem a busca paginada.
Foi implementado a segurança da API com JWT, Refresh Token e Logout, com a utilização do Redis para guardar o estado dos Refresh Token e dos token Blacklist.
O Redis também foi utilizado para implementar o Cache Aside Pattern nos endpoints de consultas que podem ser repetitivas, como o de consultar um produto por ID.
Foi utilizado a lib Tsyringe para implementar a Injeção de Dependência, e o Prisma ORM para a modelagem das entidades do banco de dados.
Para validar o body das requisições POST e PUT, foi utilizado a lib class-validator, e para mostrar as mensagens de erros dos campos foi implementado um middleware de validação que serve para o body ou para a query.
A API conta com testes unitários das camadas de Service e Controllers com o Jest, e testes de integração/E2E com Supertest e TestContainers para simular o ambiente real, com bancos de dados executados via containers.
Foi integrado também uma pipeline de CI/CD com Github Actions para que, a cada vez que um novo commit for realizado, automaticamente seja executado o build e os testes da API e, em seguida, construída a imagem Docker da API, que será enviada para um repositório Docker.

<img width="1903" height="917" alt="Image" src="https://github.com/user-attachments/assets/a6f06d04-5649-4c54-88dd-5bf29828db4a" />

## Tecnologias 💻
 
- [Node.js](https://nodejs.org/pt)
- [Express](https://expressjs.com/pt-br/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/pt-BR/)
- [Supertest](https://www.npmjs.com/package/supertest)
- [PostgreSQL](https://www.postgresql.org/)
- [PgAdmin](https://www.pgadmin.org/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [TestContainers](https://testcontainers.com/)
- [Github Actions](https://docs.github.com/pt/actions)

## Diferenciais 🔥

Alguns diferenciais:

* Utilização de Docker
* Node.js com TypeScript
* Testes Unitários com Jest
* Testes de Integração com Supertest e TestContainers
* Tratamento de exceções
* Documentação Swagger
* Pipeline de CI/CD com Github Actions

## Como executar 🎉

1.Clonar repositório git:

```text
git clone https://github.com/FernandoCanabarroAhnert/express-typescript-ecommerce.git
```

2.Instalar dependências.

```text
npm install
```

3.Executar a aplicação Node.js
```text
npm run dev
```

4.Testar endpoints através do Postman ou da url do Swagger
<http://localhost:3000/docs/>

## API Endpoints 📚

Para fazer as requisições HTTP abaixo, foi utilizada a ferramenta [Postman](https://www.postman.com/):

- Cadastrar Marca
```
$ http POST http://localhost:3000/brands

input:

{
    "name": "Natura",
    "description": "Marca de Perfumes Brasileira"
}

output:

{
    "id": 1,
    "name": "Natura",
    "description": "Marca de Perfumes Brasileira"
}

```

- Cadastrar Produto
```
$ http POST http://localhost:3000/products

input:

{
    "name": "Essencial Sentir",
    "price": 159.90,
    "description": "Perfume Aromático Fresco",
    "brandId": 1,
    "categoriesIds": [2]
}

output:

{
    "id": 1,
    "name": "Essencial Sentir",
    "price": "159.9",
    "description": "Perfume Aromático Fresco",
    "brand": {
        "id": 1,
        "name": "Natura",
        "description": "Marca de Perfumes Brasileira"
    },
    "categories": [
        {
            "id": 2,
            "name": "Perfumes Nacionais",
            "description": "Categoria de Perfumes Brasileiros"
        }
    ]
}
```

- Cadastrar Pedido
```
$ http POST http://localhost:3000/orders

input:

{
    "items": [
        {
            "productId": 1,
            "quantity": 2
        },
        {
            "productId": 5,
            "quantity": 1
        }
    ]
}

output:

{
    "id": 1,
    "amount": "1519.8",
    "moment": "2025-10-05T15:34:52.557Z",
    "user": {
        "id": 1,
        "fullName": "Fernando",
        "email": "fernando@gmail.com",
        "cpf": "123.456.789-10",
        "birthDate": "2005-10-28T00:00:00.000Z",
        "roles": [
            {
                "id": 1,
                "authority": "ROLE_USER"
            },
            {
                "id": 2,
                "authority": "ROLE_ADMIN"
            }
        ]
    },
    "items": [
        {
            "productId": 1,
            "orderId": 1,
            "quantity": 2,
            "price": "159.9",
            "product": {
                "id": 1,
                "name": "Essencial Sentir",
                "price": "159.9",
                "description": "Perfume Aromático Fresco",
                "brand": {
                    "id": 1,
                    "name": "Natura",
                    "description": "Marca de Perfumes Brasileira"
                },
                "categories": [
                    {
                        "id": 2,
                        "name": "Perfumes Nacionais",
                        "description": "Categoria de Perfumes Brasileiros"
                    }
                ]
            }
        },
        {
            "productId": 5,
            "orderId": 1,
            "quantity": 1,
            "price": "1200",
            "product": {
                "id": 5,
                "name": "Versace Dylan Blue",
                "price": "1200",
                "description": "Blue Fougére da marca Versace",
                "brand": {
                    "id": 2,
                    "name": "Versace",
                    "description": "Marca de Perfumes Importados"
                },
                "categories": [
                    {
                        "id": 1,
                        "name": "Perfumes Importados",
                        "description": "Categoria de Perfumes Importados"
                    }
                ]
            }
        }
    ]
}
```

