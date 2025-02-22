CREATE TABLE "user" (
    "userID" SERIAL PRIMARY KEY,
    "is_employee" BOOLEAN NOT NULL,
    "username" varchar(200) NOT NULL,
    "password" varchar(1000) NOT NULL,
    "email" varchar(200) DEFAULT NULL,
    "firstname" varchar(200) DEFAULT NULL,
    "lastname" varchar(200) DEFAULT NULL,
    "prefered_payment_method" varchar(200) DEFAULT NULL,
    "address" varchar(200) DEFAULT NULL,
    "favorite_products" int[] DEFAULT array[]::int[],
    "past_purchases" int[] DEFAULT array[]::int[]
);

CREATE TABLE "product" (
    "productID" SERIAL PRIMARY KEY,
    "name" varchar(200) NOT NULL,
    "description" text NOT NULL,
    "price" int NOT NULL,
    "stockCount" int NOT NULL,
    "manufacturer" varchar(200) NOT NULL,
    "specsDoc" int DEFAULT NULL,
    "thumbnailID" int NOT NULL REFERENCES "file" ("fileID"),
    "pictures" int[] DEFAULT array[]::int[],
    "reviews" int[] DEFAULT array[]::int[]
);

CREATE TABLE "review" (
    "reviewID" SERIAL PRIMARY KEY,
    "rating" int NOT NULL,
    "comment" varchar(1000) NOT NULL,
    "reviewerID" int NOT NULL REFERENCES "user" ("userID"),
    "time" bigint NOT NULL
);

CREATE TABLE "file" (
    "fileID" SERIAL PRIMARY KEY,
    "name" text NOT NULL
);

