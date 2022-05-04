import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_SECRET_KEY);

import graph from "fbgraph"; //for facebook

import nodeFetch from "node-fetch" //fetch api in node


async googleLogin(tokenId) {
		//process.env.GOOGLE_CLIENT_ID it has to be change
		const clientId = process.env.GOOGLE_CLIENT_ID;

		const { payload } = await client.verifyIdToken({
			idToken: tokenId,
			audience: clientId,
			maxExpiry: 86400 // 1day
		}).catch((err) => {
			throw new Error("Invalid credentials.");
		});
			
		//create payload which would be send to register()
		const inputRegister = {
			mail: payload.email,
			name: payload.name,
			photo: payload.picture,
			verified: payload.email_verified,
			provider_uid: payload.sub, //google user id
			firstname: payload.name.split(" ")[0],
			lastname: payload.name.split(" ")[1],
			registerWith: "google",
			password: this.generateCode(10, false),
			type: "individual",
			active: 1,
		};

		const userCredentials = await this.loginWithSocial(inputRegister);

		return {
			user: userCredentials.user,
			tokens: userCredentials.tokens
		};
		// api
	}
	async facebookLogin(tokenId) {
		graph.setAccessToken(tokenId)

		var params = { fields: "picture, name, email, first_name, last_name" };
 
		const data = await graph.get("me", params, (err, res) => {
			if (err) {
				throw new Error("Fetching data failed from FB")
			}
			return res;
		});

		const resData = await nodeFetch(data.request.uri.href) //getting data from facebook

		const payload = await resData.json();

		//create payload which would be send to register()
		const inputRegister = {
			mail: payload.email,
			name: payload.name,
			photo: payload.picture.data.url,
			verified: true,
			provider_uid: payload.id, //facebook user id
			firstname: payload.first_name,
			lastname: payload.last_name,
			registerWith: "facebook",
			password: this.generateCode(10, false),
			type: "individual",
			active: 1,
		};

		const userCredentials = await this.loginWithSocial(inputRegister);

		return {
			user: userCredentials.user,
			tokens: userCredentials.tokens
		};
	}	
