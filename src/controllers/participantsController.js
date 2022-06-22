import dayjs from 'dayjs';

import { nameSchema } from '../schemas/index.js';
import { database as db } from '../index.js';

export const postParticipant = async (req, res) => {
  const { name } = req.body;
  const { error } = nameSchema.validate({ name });
  if (error) return res.status(422).send(error.details[0].message);

  try {
    const participantAlreadyExists = await db.collection('participants').findOne({ name });
    if (participantAlreadyExists) return res.status(409).send('Participant already exists');

    const participantToSend = {
      ...name,
      lastStatus: Date.now(),
    };

    const messageToSend = {
      from: name,
      to: 'Todos',
      text: 'entra na sala...',
      type: 'status',
      time: dayjs().format('HH:mm:ss'),
    };

    await db.collection('participants').insertOne(participantToSend);
    await db.collection('messages').insertOne(messageToSend);
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const getParticipants = async (_, res) => {
  try {
    const participants = await db.collection('participants').find().toArray();
    res.status(201).send(participants);
  } catch (err) {
    res.sendStatus(500);
  }
};