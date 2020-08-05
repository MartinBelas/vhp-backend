# VHP backend

Backend of web aplication for runners registration. 
It is used by frontend application [VHP frontend](https://github.com/MartinBelas/vhp-frontend) which registeres runners and provides info for the sport event [VH-půlmaratón](http://www.vh-pulmaraton.cz/) in the "Poodří" nature reservation.
The backend application can work for other events, it can also be used with other frontend applications.

## Getting Started

This application runs in [Node.js](https://nodejs.org/). It comunicates with frontend part via REST API.

### Prerequisites

#### Database

Data are stored in MySQL database.
It is ok to use some docker container for it. The docker environment for MySQL is described in [vhp-docker/mysql](https://github.com/MartinBelas/vhp-docker/tree/master/mysql)


#### API-KEY

You need to provide 'api-key' header with the request to get response from the server.
The api key is stored in .env file as API_KEY.

## Running the tests

To run unit tests run
```
npm test
```

To run integration tests run
```
npm run inttest
```

## Authors

* **Martin Belas**

