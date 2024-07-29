import User from "../models/User";
import jwt from "jsonwebtoken";
import Token, {PermissionLevel} from "../models/Token";
import {expireStringToNumber} from "../utils/utils";

async function createToken(req, res) {
  // @ts-ignore
  if (!req.user) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  const id = req.user.userId;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    const expiresIn = req.body.expiresIn || '1h';
    const permissionLevel = req.body.permissionLevel || PermissionLevel.READ;
    let options;
    if (expiresIn !== 'never') {
      options = {expiresIn};
    }
    const tokenExpiresIn = expiresIn !== 'never' ? new Date(Date.now() + expireStringToNumber(expiresIn)) : 'never';
    let token = jwt.sign({
      userId: user.id,
      username: user.username,
      permissionLevel,
      expiresAt: tokenExpiresIn
    }, 'your_jwt_secret', options);
    await Token.create({
      userId: user.id,
      token,
      permissionLevel,
      expiresAt: tokenExpiresIn
    });
    res.status(201).json({message: 'Token created', token});
  } catch (error) {
    res.status(500).json({message: 'Error creating token', error});
  }
}

async function deleteToken(req, res) {
  console.log(req.user);
  // @ts-ignore
  if (!req.user) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  const {id} = req.params;
  console.log(id);
  try {
    const token = await Token.findByPk(id);
    if (!token) {
      return res.status(404).json({message: 'Token not found'});
    }
    await token.destroy();
    res.json({message: 'Token deleted'});
  } catch (error) {
    res.status(500).json({message: 'Error deleting token', error});
  }
}

async function getTokens(req, res) {
  // @ts-ignore
  if (!req.user) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  try {
    const tokens = await Token.findAll({where: {userId: req.user.userId}});
    res.json(tokens);
  } catch (error) {
    res.status(500).json({message: 'Error getting tokens', error});
  }
}

export {createToken, deleteToken, getTokens};

