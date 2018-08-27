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

function generateAuthor() {
	return {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName()
	};
}

function generateBlogPostData() {
	return {
		title: faker.lorem.words(),
		author: generateAuthor(),
		content: faker.lorem.paragraph()
	};
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase(); 
}



describe('BlogPost API resource', function() {


	before(function() {
		return runServer(TEST_DATABASE_URL); 
	});

	beforeEach(function() {
		return seedBlogPostData();
	});

	afterEach(function() {
		return tearDownDb(); 
	});

	after(function() {
		return closeServer(); 
	})

	describe('GET endpoint', function() {

		it('should return all existing blog posts', function() {
			let res
			return chai.request(app)
				.get('/posts')
				.then(function(_res) {
					res = _res;
					expect(res).to.have.status(200); 
					expect(res.body).to.have.lengthOf.at.least(1);
					return BlogPost.count();
				})
				.then(function(count) {
					expect(res.body).to.have.lengthOf(count); 
				});
		});

		it('should return a blog post with right fields', function(){

			let resPost; 
			return chai.request(app)
				.get('/posts')
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('array'); 
					expect(res.body).to.have.lengthOf.at.least(1);

					res.body.forEach(function(post){
						expect(post).to.be.an('object');
						expect(post).to.include.keys(
								'id', 'title', 'author', 'content');
					});
					resPost = res.body[0];
					return BlogPost.findById(resPost.id);
				})
				.then(function(post) {

					expect(resPost.id).to.equal(post.id);
					expect(resPost.title).to.equal(post.title);
					expect(resPost.author).to.equal(`${post.author.firstName} ${post.author.lastName}`);
					expect(resPost.content).to.equal(post.content)
				});
		});
	});

	describe('POST endpoint', function() {

		it('should add a new blog post', function() {

			const newPost = generateBlogPostData();

			return chai.request(app)
				.post('/posts')
				.send(newPost)
				.then(function(res){
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys(
						'id', 'title', 'author', 'content'); 
					expect(res.body.author).to.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
					expect(res.body.id).to.not.be.null;
					expect(res.body.title).to.be.equal(newPost.title);
					expect(res.body.content).to.be.equal(newPost.content); 

					return BlogPost.findById(res.body.id); 
				})
				.then(function(post) {
					expect(`${post.author.firstName} ${post.author.lastName}`).to.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
					expect(post.title).to.equal(newPost.title); 
					expect(post.content).to.equal(newPost.content); 
				});
		});
	});

	describe('PUT endpoint', function(){

		it('should update fields you send over', function() {

			const updateData = {
				title: "Updated Name",
				content: faker.lorem.paragraph()
			}

			return BlogPost
				.findOne()
				.then(function(post) {
					updateData.id = post.id;

					return chai.request(app)
						.put(`/posts/${updateData.id}`)
						.send(updateData);
				})
				.then(function(res){
					expect(res).to.have.status(204); 

					return BlogPost.findById(updateData.id)
				})
				.then(function(post) {
					expect(post.id).to.equal(updateData.id);
					expect(post.content).to.equal(updateData.content);
					expect(post.title).to.equal(updateData.title);
				});
		});
	});

	describe('DELETE endpoint', function() {


		it('should delete post by id', function() {
			let post; 

			return BlogPost
				.findOne()
				.then(function(_post) {
					post = _post;
					return chai.request(app).delete(`/posts/${post.id}`)
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return BlogPost.findById(post.id); 
				})
				.then(function(_post) {
					expect(_post).to.be.null; 
				});
		});
	});



});


















