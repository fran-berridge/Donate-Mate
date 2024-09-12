import { Router } from 'express'
import checkJwt, { JwtRequest } from '../auth0.ts'
import { StatusCodes } from 'http-status-codes'

import * as db from '../db/dbTypes.ts'

const router = Router()

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  if (!id) {
    return res.sendStatus(StatusCodes.NOT_FOUND)
  }
  try {
    const type = await db.getTypesById(id)
    res.json(type)
  } catch (err) {
    next(err)
  }
})

router.post('/', checkJwt, async (req: JwtRequest, res, next) => {
  if (!req.auth?.sub) {
    res.sendStatus(StatusCodes.UNAUTHORIZED)
    return
  }

  try {
    const { name, accepting, urgentlySeeking, organisationId, date } = req.body
    const id = await db.addType({
      name,
      accepting,
      urgentlySeeking,
      organisationId,
      date,
      id: 0,
    })
    res
      .setHeader('Location', `${req.baseUrl}/${id}`)
      .sendStatus(StatusCodes.CREATED)
  } catch (err) {
    next(err)
  }
})

export default router
