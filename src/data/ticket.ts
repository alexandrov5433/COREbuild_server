import { pool } from "./postgres.js";
import logger from "../config/winston.js";
import { TicketCreationData, TicketData, TicketAnswerData, TicketFiltrationOptions } from "./definitions.js";
import { PoolClient } from "pg";

export async function createNewTicketInDB(ticketCreationData: TicketCreationData): Promise<TicketData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            INSERT INTO "ticket" (title, status, content_question, time_open, email_for_answer, "userID_submit")
            VALUES (
                $1,
                'open',
                $2,
                $3,
                $4,
                $5
            ) RETURNING *;
        `, [
            ticketCreationData.title,
            ticketCreationData.content_question,
            ticketCreationData.time_open,
            ticketCreationData.email_for_answer,
            ticketCreationData.userID_submit || null
        ]);        
        if (res?.rows[0].id) {
            return res.rows[0];
        }
        return null
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function addAnswerToTicketInDB(ticketAnswerData: TicketAnswerData): Promise<TicketData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            UPDATE "ticket" SET
                "status"='closed',
                "content_answer"=$2,
                "time_close"=$3,
                "userID_employee"=$4
            WHERE "id"=$1
            RETURNING *;
        `, [
            ticketAnswerData.id,
            ticketAnswerData.content_answer,
            ticketAnswerData.time_close,
            ticketAnswerData.userID_employee
        ]);        
        if (res?.rows[0].id) {
            return res.rows[0];
        }
        return null
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function findTicketById(id: number): Promise<TicketData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "ticket" WHERE "id"=$1;
        `, [id]);        
        if (res?.rows[0].id) {
            return res.rows[0];
        }
        return null
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getFilteredTicketsFromDB(filtrationOptions: TicketFiltrationOptions) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        let currentPage = filtrationOptions.currentPage || 1;
        const itemsPerPage = filtrationOptions.itemsPerPage || 4;
        const res = await client.query(`SELECT * FROM "ticket";`);

        let payload: Array<TicketData> = res?.rows;

        // filter
        if (filtrationOptions.id) {
            payload = payload.filter(t => t.id == filtrationOptions.id)
        }
        if (filtrationOptions.status) {
            payload = payload.filter(t => t.status == filtrationOptions.status)
        }

        // sort
        if (filtrationOptions.time_open == 'ascending') {
            payload.sort((a, b) => Number(a.time_open) - Number(b.time_open));
        }
        if (filtrationOptions.time_open == 'descending') {
            payload.sort((a, b) => Number(b.time_open) - Number(a.time_open));
        }

        const pagesCount = Math.ceil(payload.length / itemsPerPage);
        if (currentPage > pagesCount) {
            currentPage = 1;
        }
        const currentPagePortion = payload.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return {
            pagesCount,
            currentPage,
            tickets: currentPagePortion
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

