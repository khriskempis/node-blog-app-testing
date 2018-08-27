'use strict'; 

const chai = require('chai');
const chatHttp = require('chai-http');
const faker = require('faker'); 
const mongoose = require('mongoose'); 

const expect = chai.expect;

const { BlogPost } = require('../models'); 
const { app, runServer, closeServer } = require('../server'); 
const { TEST_DATABASE_URL } = require('../config'); 

chai.use(chatHttp);

function seedBlogPostData() {
	console.info('seeding blog post data'); 
	const seedData = [];

	for (let i=0; i<=10; i++) {
		seedData.push(generateBlogPostData()); 
	}

	return BlogPost.insertMany(seedData); 
};