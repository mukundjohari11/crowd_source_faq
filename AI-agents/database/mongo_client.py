from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings

logger = logging.getLogger(__name__)


class MongoClient:
    """Async MongoDB client for the AI microservice."""

    _client: AsyncIOMotorClient | None = None
    _db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Open connection to MongoDB Atlas."""
        import certifi

        settings = get_settings()
        self._client = AsyncIOMotorClient(
            settings.mongodb_uri,
            tlsCAFile=certifi.where(),
        )
        self._db = self._client[settings.mongodb_db_name]

        # Verify connectivity
        await self._client.admin.command("ping")
        logger.info(
            "Connected to MongoDB at %s (db=%s)",
            settings.mongodb_uri,
            settings.mongodb_db_name,
        )

    async def close(self) -> None:
        """Close the MongoDB connection."""
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed")

    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Return the database instance."""
        if self._db is None:
            raise RuntimeError("MongoClient is not connected. Call connect() first.")
        return self._db

    # Unanswered Questions 

    async def save_unanswered_question(
        self,
        question: str,
        suggested_faq: dict[str, str] | None = None,
    ) -> str:
        """Save an unanswered question to MongoDB.

        Args:
            question: The original user question.
            suggested_faq: Optional dict with 'suggested_question' and 'suggested_answer'.

        Returns:
            The inserted document ID as a string.
        """
        doc: dict[str, Any] = {
            "question": question,
            "suggested_question": (suggested_faq or {}).get("suggested_question"),
            "suggested_answer": (suggested_faq or {}).get("suggested_answer"),
            "created_at": datetime.now(timezone.utc),
        }
        result = await self.db.unanswered_questions.insert_one(doc)
        doc_id = str(result.inserted_id)
        logger.info("Saved unanswered question (id=%s)", doc_id)
        return doc_id

    async def get_unanswered_questions(
        self,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        """Retrieve unanswered questions from MongoDB.

        Args:
            limit: Maximum number of results.
            skip: Number of results to skip.

        Returns:
            List of unanswered question documents.
        """
        cursor = (
            self.db.unanswered_questions
            .find()
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        questions: list[dict[str, Any]] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            questions.append(doc)

        logger.debug("Retrieved %d unanswered questions", len(questions))
        return questions

    async def count_unanswered_questions(self) -> int:
        """Count total unanswered questions."""
        return await self.db.unanswered_questions.count_documents({})
