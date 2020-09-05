const express = require("express");
const cors = require("cors");
const { uuid, isUuid } =require('uuidv4');
const { response } = require("express");
//const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
//verifica se é um id valido
function validateProjectId(request, response, next){
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({ error: 'Invalid project ID.'})
  }
  return next();
}

function logRequests(request, response, next){
 const { method, url } = request
 const logLabel = `[${method.toUpperCase()}] ${url}`;
 console.time(logLabel) //mede o tempo de um console ate o outro
 next();//proximo middleware

 console.timeEnd(logLabel)// a mesma string nos parenteses

}

app.use(logRequests);
app.use('/repositories/:id', validateProjectId) //valida somente nas rotas :id

app.get("/repositories", (request, response) => {

  const {title} = request.query;
  //verifica se há dados no filtro, se foi preencido ele retorna os dados senão retorna todos os projects
  const results = title 
    ? repositories.filter(project => project.title.includes(title))
    : repositories; 


  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;
  const repositorio = {
    id: uuid(), 
    title, 
    url, 
    techs, 
    likes:0,
  }
  
  repositories.push(repositorio)
  return response.json(repositorio);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs} = request.body;

  const findRepositoryIndex = repositories.findIndex(repositorio =>
    repositorio.id === id
  );  
    //quando não existir
  if (findRepositoryIndex===-1){
    return response.status(400).json({error: 'Repositorio does not exists.'});
  }

  const repositorio ={
    id,
    title,
    url,
    techs,
    likes: repositories[findRepositoryIndex].likes,
  };

repositories[findRepositoryIndex]=repositorio

return response.json(repositorio);
})

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const findRepositoryIndex = repositories.findIndex(repositorio =>
    repositorio.id === id
);
  if (findRepositoryIndex >=0){
    repositories.splice(findRepositoryIndex,1)
  } else {
    return response.status(400).json({ error: 'Repository does not exist'})
  }
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  //busca o id da requisição
  const { id } =request.params;

  //busca o repositorio
  const findRepositoryIndex= repositories.findIndex(repositorio =>
    repositorio.id ===id 
  );
  //se não existir
  if (findRepositoryIndex === -1){
    return response.status(400).json({ error:'Repositorio does not exist.'});
  }

  //se existir
  repositories[findRepositoryIndex].likes+=1;

  //retorna o repositorio atualizado
  return response.json(repositories[findRepositoryIndex]);

});

module.exports = app;
