-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");

-- CreateIndex
CREATE INDEX "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_parentId_createdAt_idx" ON "Post"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_repostId_idx" ON "Post"("repostId");

-- CreateIndex
CREATE INDEX "Post_quoteId_idx" ON "Post"("quoteId");
