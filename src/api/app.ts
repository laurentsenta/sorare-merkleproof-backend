import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { pull, last } from 'lodash';
import * as onFinished from "on-finished";
import { MongoDBStorage } from "../data";
import { IGmailDocument } from "../data/storage";
import { makeLogger } from "../logging";
import { IEmailFilterQuery, ILabel } from "../types";

const log = makeLogger("app");

export const makeApp = (storage: MongoDBStorage) => {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  app.use((req, res, next) => {
    log.inTestEnv(">>>", req.method, req.path, req.query, req.params, req.body);

    onFinished(res, (err, res) => {
      if (err) {
        log.toInvestigateTomorrow(
          req.method,
          req.path,
          req.query,
          req.body,
          res.statusCode,
          err
        );
      } else {
        log.inTestEnv(
          "<<<",
          req.method,
          req.path,
          req.query,
          req.body,
          res.statusCode
        );
      }
    });
    next();
  });

  app.use((err, _req, _res, next) => {
    log.wakeMeUpInTheMiddleOfTheNight(err);
    next(err);
  });

  app.get("/status", (_req, res) => {
    res.send("OK");
  });

  app.get("/emails", async (req, res) => {
    let filter = undefined

    if (req.query.filter) {
      // TODO: validate
      filter = JSON.parse(req.query.filter as string) as IEmailFilterQuery
    }

    const emails = await storage.listEmails(filter)

    const getHeader = (email: IGmailDocument, name: string): string | number | undefined => {
      return email.payload?.headers.find(header => header.name === name)?.value
    }

    const extractMail = (s: string | undefined): string | undefined => {
      // "Amazon.fr" <confirmation-commande@amazon.fr>
      // .* <(.*)>
      const match = s.match(/.* <(.*)>/)
      try {
        return match[1]
      } catch (err) {
        console.log(s)
        console.log(match)
        console.log(err)
        return s
      }
    }
    const getDomainFromMail = (s: string | undefined): string | undefined => {
      return last(s.split('@')) || ''
    }

    const tweaked = emails.map(email => {
      const from = extractMail(getHeader(email, 'From') + '') || ''
      const to = getHeader(email, 'To') + ''
      const object = getHeader(email, 'Subject')

      const from_domain = getDomainFromMail(from)
      const to_domain = getDomainFromMail(to)

      return ({
        from,
        from_domain,
        to,
        to_domain,
        object,
        ...email
      })
    })

    // console.log(tweaked)

    return res.json(tweaked)
  });

  app.get("/labels", async (_req, res) => {
    const labelDocs = await storage.listLabels()

    const potentialRoots = labelDocs.map(x => x._id)
    const labels: { [key: string]: ILabel } = {}

    labelDocs.forEach(l => {
      labels[l._id] = { ...l, children: [] }
    })

    labelDocs.forEach(l => {
      l.children.forEach(childrenId => {
        labels[l._id].children.push(labels[childrenId])
        pull(potentialRoots, childrenId)
      })
    })

    const result = Object.values(labels).filter(x => potentialRoots.includes(x._id))

    return res.json(result)
  });

  app.get("/labels/:labelId", async (req, res) => {
    const { labelId } = req.params

    const labelDocs = await storage.listLabels()

    const labels: { [key: string]: ILabel } = {}

    labelDocs.forEach(l => {
      labels[l._id] = { ...l, children: [] }
    })

    labelDocs.forEach(l => {
      l.children.forEach(childrenId => {
        labels[l._id].children.push(labels[childrenId])
      })
    })

    console.log(labels, labelId)

    const result = labels[labelId]

    console.log('label:', result)

    return res.json(result)
  });

  app.post("/labels", async (_req, res) => {
    const insertedId = await storage.createLabel({ title: 'New Label' });
    return res.json({ status: 'ok', insertedId })
  });


  app.put("/labels/:_id", async (req, res) => {
    const { _id } = req.params
    const { title, inputFilter, children } = req.body

    await storage.updateLabel({ _id, title, inputFilter, children })
    return res.json({ status: 'ok' })
  });

  app.post("/labels/:_id/children", async (req, res) => {
    const { _id } = req.params
    const insertedId = await storage.createLabel({ title: 'New Label' }, { parent: _id });
    return res.json({ status: 'ok', insertedId })
  });

  app.put("/labels/:labelId/emails/:emailId", async (req, res) => {
    const { labelId, emailId } = req.params
    await storage.assignLabel({ labelId, emailId })
    return res.json({ status: 'ok' })
  });

  return app;
};
