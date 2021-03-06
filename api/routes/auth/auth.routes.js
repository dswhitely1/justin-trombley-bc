const authRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const generatePassword = require('../../utils/generatePassword');
const generateToken = require('../../utils/generateToken');
const Users = require('../../../data/models/users.model');

/**
 * @apiDefine UserNotFound
 * @apiError UserNotFound Username is not in the system
 */

/**
 * @apiDefine NotAuthorized
 * @apiError NotAuthorized Incorrect Password
 */

/**
 * @apiDefine UserNameAlreadyTaken
 * @apiError UserNameAlreadyTaken Username has already been taken
 */

/**
 * @api {post} /api/auth/register Registers a New User
 * @apiUse UserNameAlreadyTaken
 * @apiVersion 1.0.0
 * @apiName RegisterUser
 * @apiGroup Auth
 * @apiPermission none
 * @apiDescription Registers a New User
 * @apiParam {String} username The New Users username
 * @apiParam {String} password The New Users password
 *
 * @apiSuccess {Object} user The Newly Created User
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "id": 2,
 *   "username": "testuser",
 *   "created_at": "2019-10-19 19:58:08",
 *   "updated_at": "2019-10-19 19:58:08"
 * }
 * @apiErrorExample {json} Username-Already-Taken
 * {
 *      "message": "Username is already taken"
 * }
 */

function register (req, res) {
	Users.findBy({ username: req.body.username })
		.then(foundUser => {
			if (foundUser.length === 0) {
				const newPassword = generatePassword(req.body.password);
				Users.add({ username: req.body.username, password: newPassword })
					.then(saved => {
						const newUser = {
							id         : saved[0].id,
							username   : saved[0].username,
							created_at : saved[0].created_at,
							updated_at : saved[0].updated_at,
						};
						res.status(201).json(newUser);
					})
					.catch(err => res.status(500).json(err));
			}
			else {
				res.status(400).json({ message: 'Username is already taken' });
			}
		})
		.catch(err => res.status(500).json('register', err));
}

/**
 * @api {post} /api/auth/login Logs an User In
 * @apiUse UserNotFound
 * @apiUse NotAuthorized
 * @apiVersion 1.0.0
 * @apiName LoginUser
 * @apiGroup Auth
 * @apiPermission none
 * @apiDescription Logs an User In
 * @apiParam {String} username Username of the User
 * @apiParam {String} password Password of the User
 * @apiSuccess {Object} The Users welcome message, token, and user object
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "message": "Welcome back test",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNTcxNTE0NzcwLCJleHAiOjE1NzE2MDExNzB9.4iEFSx0i7V8cvYgZ0ALRAQG1aUTqqguQ5xDG86sgpjg",
 *   "user": {
 *      "id": 1,
 *      "username": "test",
 *      "created_at": "2019-10-19 18:21:31",
 *      "updated_at": "2019-10-19 18:21:31"
 *   }
 * }
 * @apiErrorExample {json} Username-Not-Found-Response
 * {
 *      "message": "Username is not in the system."
 * }
 * @apiErrorExample {json} Incorrect-Password
 * {
 *      "message": "Incorrect Password"
 * }
 */

function login (req, res) {
	Users.findBy({ username: req.body.username })
		.then(user => {
			if (user) {
				if (bcrypt.compareSync(req.body.password, user[0].password)) {
					const token = generateToken(user[0]);
					const sentUser = {
						id         : user[0].id,
						username   : user[0].username,
						created_at : user[0].created_at,
						updated_at : user[0].updated_at,
					};
					res.json({
						message : `Welcome back ${sentUser.username}`,
						token,
						user    : sentUser,
					});
				}
				else {
					res.status(401).json({ message: 'Incorrect Password' });
				}
			}
			else {
				res.status(404).json({ message: 'Username is not in the system.' });
			}
		})
		.catch(err => res.status(500).json('Login', err));
}

authRouter.post('/register', register).post('/login', login);

module.exports = authRouter;
