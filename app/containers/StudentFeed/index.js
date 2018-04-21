/**
 *
 * StudentFeed
 * 
 * HOW PRINTING POSTS WORKS:
 * On componentdidmount (once page loads), it retrieves all student posts and sets it to this.state.posts
 * When that is done, it calls createpostsTable, where it creates the html to display each posts
 * createPostsTable saves the posts html in this.state.printPosts and makes this.state.postsReady to true
 * 
 * in the render method is printPosts, which is a method that waits until postsReady is set to true to render
 * the posts
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { withRouter } from "react-router-dom";
import styled from 'styled-components';

import HeaderFeed from 'components/HeaderFeed';
import Button from 'components/Button';
import H1 from 'components/H1';
import CheckboxTableStyle from 'components/TableCheckbox/CheckboxTableStyle';
//import TableStyle from 'components/Table/TableStyle';
import Group from 'components/FormComponents/CheckboxOrRadioGroup';

import CenteredSection from './CenteredSection';
import Modal from './Modal';
import NewPostForm from './NewPostForm';
import Img from './Img';

import graduationcap from './graduation-cap.png';

const BodyWrapper = styled.div`
  max-width: calc(1000px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

const Post = styled.div`
	border: 2px solid;
	border-color: FFB71C;
	width: 100%;
	height: 100%;
	background: #EEECE9;
	text-align: center;
	padding: 2em;
`;

export class StudentFeed extends React.Component { // eslint-disable-line react/prefer-stateless-function

	constructor(props) {
		super(props);
		this.link = 'https://tutor-find.herokuapp.com';

		if (this.refs.myRef) {
		this.setState({
			posts : [],
			printPosts: [],

			filterOptions: ["mySubjects","allSubjects"],
			filter: ["mySubjects"],

			isOpen: false, //whether the sign in modal is rendered
            isLoading: true, //waits till component is finished loading so that buttons dont auto redirect
		});

		this.handleFilterSelect = this.handleFilterSelect.bind(this);

		//this.componentDidMount = this.componentDidMount.bind(this);	
		this.createPostsTable = this.createPostsTable.bind(this);
		this.printPosts = this.printPosts.bind(this);
		this.fetchPosts = this.fetchPosts.bind(this);
		}
	}

	toggleModal = () => { //opens and closes the sign in modal
		this.setState({
		  isOpen: !this.state.isOpen
		});
	}

	handleFilterSelect(e) {
		this.setState({filter: [e.target.value]}, () => console.log(this.state.filter));
	}

	componentDidMount(){
			this.fetchPosts();
	}

	fetchPosts() {

		var allPosts = [];
		var userInfo = [];
		var postsReady = false;

		fetch(this.link + '/posts?type=tutor', {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',	
			}
		})
		.then(response => response.json())
		.then(posts => {

			for (var i =0; i < posts.length; i++){
				if (i <= 25){// loads the 25 most recent posts
					allPosts.push(posts[i]);
				}
				else{
					break;
				}
			}
			this.setState({ posts: allPosts, isLoading: false }, () => this.createPostsTable());
		})
		.catch(error => console.log('parsing failed', error));

	}

	apply(post){
		console.log("applying");
		
		fetch('https://tutor-find.herokuapp.com/tutors/' + post.ownerId.toString())
      	.then(response => response.json()) //gets post owner from server
		.then(owner => owner.email) //gets owner's email	  
      	.then(mail => { //on success
        	var email = mail;
        	var subject = "A Student is interested in your listing!";
        	var body = "Hello, I'm interested! Please let me know if you'd like to connect.";
			body +=   "    Name: " + this.props.legalFirstName + " " + this.props.legalLastName + 
					  "    Major: " + this.props.major + "    Bio: "+ this.props.bio;
        	                 
        	var win = window.open("", "emailLink", "width=300,height=100");
        	win.document.close();
        	win.document.write( '<a href="mailto:' + email + '?subject=' + subject + '&body=' + body + '">' + 'Click here to email the tutor.' + '<' + '/a>');
        	win.focus();
        })
		  .catch(error => console.log('parsing failed', error));
	
	}

	createPostsTable(){
		var returnPosts =[];

		if (this.state != null && this.state.isLoading == false){
			
			if (this.state.posts.length != 0){
				return this.state.posts.map((post) => {	//for each post...
					
					//ensures that no glitcy posts crash the app :)
					if(post.subject != null && post.location != null && post.availability != null
						&& post.rate != null && post.unit != null) {

							//fetch the post owner's info
							fetch(this.link + '/tutors/' + post.ownerId, {
								method: 'get',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json',	
								}
							})
							.then(response => {
								if (response.status == 200){ //checks if user was found
									return response.json();
								} else {
									return null;
								}
							})
							.then( tutor => {
								//console.log(post.postId);
								console.log(tutor);
								if (tutor != null && tutor != undefined){
									//print out availiability neatly without special characters
									var avail = "";
									for (var i =0; i < post.availability.length; i++){
										if (post.availability.charAt(i).match(/[a-zA-Z]/)){
											avail += post.availability.charAt(i);
										} else if (post.availability.charAt(i).match(/[,]/)){
											avail += " | ";
										} else {
											avail += " ";
										}
									}
									console.log("avail", avail);

									returnPosts.push (
										<div key={post.postId}>
											<Post>
												<h3> {tutor.legalFirstName} {tutor.legalLastName} </h3>
												<img src={tutor.img} width="150px" height="150px"/>
												<p> Highest Degree: {tutor.degrees} </p> <hr />
												<p> {post.subject} </p>
												<p> Preferred Meeting Location: {post.location} </p>
												<p> {avail} </p>
												<p> {post.rate} {post.unit} </p>
												<Button onClick={() => this.apply(post)}> Apply </Button>
											</Post>							
											<br />
										</div>
									);
									this.setState({printPosts: returnPosts}, () => console.log("printposts", this.state.printPosts));
								}//end if tutor != null
								else {
									console.log("null tutor");
								}
							})// end then				

							this.setState({postsReady: true});
					}//end check bad posts
				});
			}
			else {
				//return false;
			}
		}//end check if state is null
	}

	printPosts(){
		if (this.state.postsReady == true){
			return this.state.printPosts;
		} else {
			return(
				<div>
					<br />
					<h3> Could not load any posts! </h3>
					<br />
				</div>
			);
		}
	}
	
  	render() {
		
		if (this.state != null){
    	return (
    	<div ref="myRef">
        	<Helmet>
        	  <title> StudentFeed </title>
        	  <meta name="description" content="Description of StudentFeed" />
        	</Helmet>
		
			<HeaderFeed />

			<CheckboxTableStyle>		
         		<tr>
            		<th>
						<input type="radio" id="classSubject" name="subject" value="mySubjects" 
						onClick={() => { this.setState({filter: "mySubjects"}, () => console.log("filter", this.state.filter))}} />

                		<label htmlFor="classSubject">   My subjects </label>
            		</th>
        		</tr>
        		<tr>
            		<th>
						<input type="radio" id="classSubject" name="subject" value="allSubjects" checked="true"
						onClick={() => 
							this.setState({filter: "allSubjects"}, () => {console.log("filter", this.state.filter)}) } />

                		<label htmlFor="classSubject">   All subjects </label>
            		</th>
        		</tr>
        		<tr>
            		<th><Button>Filter Subjects</Button></th>
				</tr>
				<tr>
					<td> <Button onClick={() => this.props.history.goBack()}> Back </Button> </td>
				</tr>
				
						{/*
				<Group
					title={''}
					type={'radio'}
					setName={'filter'}
					controlFunc={this.handleFilterSelect}
					options={this.state.filterOptions}
					selectedOptions={this.state.filter}
					 />
				<Button>Filter Subjects</Button>
				*/}
        	</CheckboxTableStyle>

			<BodyWrapper>
				<CenteredSection>

					{/* make a new post */}
					<Button onClick={this.toggleModal}> New Post </Button>

					<Modal show={this.state.isOpen} onClose={this.toggleModal}>
						<H1> New Post </H1>
						<NewPostForm />
					</Modal>
					{/* end make new post */}

					{/* link to studentPost */}
					<Button onClick={() => { // link to student's posts
						if (this.state.isLoading == false){
							this.props.history.push("/studentPosts");
						}
					}}> My Posts </Button>
					{/* end link to studentPost */}

					
					<H1> Available Tutors </H1>
					<Img src={graduationcap} alt="graduation-cap"/>
					<br /><br />

					{/* Load tutor posts */}
					<table>
						{this.printPosts()}
					</table>
					
				</CenteredSection>
			</BodyWrapper>
      	</div>
    	);
	  }
	  else {
		return (
			<div>
        		<Helmet>
        	 		<title> StudentFeed </title>
        	 	    <meta name="description" content="Description of StudentFeed" />
        		</Helmet>
		
				<HeaderFeed />
				<CenteredSection>
					<br /> <H1> Loading... </H1> <br />
				</CenteredSection>
			</div>
		);
	  }}
}

function mapStateToProps(state) {

	return{
		legalFirstName: state.legalFirstName,
		legalLastName: state.legalLastName,
		bio: state.bio,
		major: state.major,
	}
}

export default withRouter( connect(mapStateToProps)(StudentFeed) );
