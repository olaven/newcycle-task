## What I want to show 
* a data model lending itself to answering the questions being asked 
* pushing live updates to the clients using [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
* building a pub-sub architecture for events, using postgres as a message broker 

## Room for improvement
* Thorough automated tests 
* not store clients in memory
* security does not exist 
* input validation hardly exists 
* no time spent on GUI
* frontend lacks typing 
* stronger typing in backend
* organization of modules leaves some things to be desired

## Setup 
The system expects a local `.env` file with the following environment variables: 
```
# values can be swapped 
SERVER_PORT=8080 
WS_PORT=8081
DASHBOARD_PORT=8082
PGPORT=5432 
PGDATABASE=newcycle 
PGUSER=user 
PGPASSWORD=password 
```