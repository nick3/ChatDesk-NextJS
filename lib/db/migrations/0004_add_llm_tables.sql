CREATE TABLE IF NOT EXISTS "Provider" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(64) NOT NULL,
  "type" varchar(32) NOT NULL,
  "apiKey" varchar(256) NOT NULL,
  "baseUrl" varchar(256) NOT NULL,
  "isCustom" boolean DEFAULT false,
  "userId" uuid NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "Provider_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Model" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "providerId" uuid NOT NULL,
  "modelId" varchar(64) NOT NULL,
  "name" varchar(128) NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "Model_providerId_Provider_id_fk" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Assistant" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(64) NOT NULL,
  "systemPrompt" text,
  "modelId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "Assistant_modelId_Model_id_fk" FOREIGN KEY ("modelId") REFERENCES "Model"("id"),
  CONSTRAINT "Assistant_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id")
);
