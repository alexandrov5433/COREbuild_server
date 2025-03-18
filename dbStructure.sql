﻿CREATE TABLE "user" (
    "userID" SERIAL PRIMARY KEY,
    "is_employee" BOOLEAN NOT NULL,
    "username" varchar(200) NOT NULL,
    "password" varchar(1000) NOT NULL,
    "email" varchar(200) DEFAULT NULL,
    "firstname" varchar(200) DEFAULT NULL,
    "lastname" varchar(200) DEFAULT NULL,
    "address" varchar(200) DEFAULT NULL,
    "favorite_products" int[] DEFAULT array[]::int[],
    "shopping_cart" JSONB DEFAULT '{}'
);
ALTER TABLE "user" ADD COLUMN "shopping_cart" JSONB DEFAULT NULL;
ALTER TABLE "user" ALTER COLUMN "shopping_cart" SET DEFAULT '{}';
ALTER TABLE "user" DROP COLUMN "past_purchases";
ALTER TABLE "user" DROP COLUMN "prefered_payment_method";

CREATE TABLE "product" (
    "productID" SERIAL PRIMARY KEY,
    "name" varchar(200) NOT NULL,
    "description" text NOT NULL,
    "categoryID" int NOT NULL REFERENCES "category" ("categoryID"),
    "price" int NOT NULL,
    "stockCount" int NOT NULL,
    "manufacturer" varchar(200) NOT NULL,
    "specsDocID" int DEFAULT NULL,
    "thumbnailID" int NOT NULL REFERENCES "file" ("fileID"),
    "pictures" int[] DEFAULT array[]::int[]
);
ALTER TABLE "procuct" DROP COLUMN "reviews";

CREATE TABLE "review" (
    "reviewID" SERIAL PRIMARY KEY,
    "productID" int NOT NULL REFERENCES "product" ("productID"),
    "rating" int NOT NULL,
    "comment" text NOT NULL,
    "reviewerID" int NOT NULL REFERENCES "user" ("userID"),
    "time" bigint NOT NULL,
    "isVerifiedPurchase" boolean NOT NULL
);
ALTER TABLE "review" ADD COLUMN "isVerifiedPurchase" boolean NOT NULL;
ALTER TABLE "review" ADD COLUMN "productID" int NOT NULL REFERENCES "product" ("productID");
ALTER TABLE "review" ALTER COLUMN "comment" TYPE text NOT NULL;

CREATE TABLE "file" (
    "fileID" SERIAL PRIMARY KEY,
    "name" text NOT NULL
);

CREATE TABLE "category" (
    "categoryID" SERIAL PRIMARY KEY,
    "name" varchar(200) NOT NULL UNIQUE 
);

CREATE TYPE payment_status_options AS ENUM ('pending', 'paid');
CREATE TYPE shipping_status_options AS ENUM ('pending', 'sent');

CREATE TABLE "order" (
    "id" SERIAL PRIMARY KEY,
    "payment_status" payment_status_options NOT NULL,
    "shipping_status" shipping_status_options NOT NULL,
    "content" JSONB NOT NULL,
    "recipient" int NOT NULL REFERENCES "user" ("userID"),
    "placement_time" bigint NOT NULL,
    "total_price" int NOT NULL,
    "paypal_order_id" text NOT NULL
)
ALTER TABLE "order" ADD COLUMN "total_price" int NOT NULL;
ALTER TABLE "order" ADD COLUMN "paypal_order_id" text NOT NULL;

DROP TABLE IF EXISTS "user", "product", "review", "file", "category" CASCADE;