drop database if exists eblist;
create database eblist;
use eblist;

create table User (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   password varchar(50),
   whenRegistered datetime not null,
   termsAccepted datetime,
   role int unsigned not null,  # 0 normal, 1 admin
   zip varchar(5) not null,
   latitude decimal(9, 6) DEFAULT 0,
   longitude decimal(9, 6) DEFAULT 0,
   unique key(email)
);

create table Category (
   id int primary key,
   name varchar(255) not null
);

create table Item (
   id int auto_increment primary key,
   ownerId int not null,
   categoryId int not null,
   title varchar(255) not null,
   description varchar(3000),
   price int not null,
   postTime datetime,
   imageUrl varchar(255),
   constraint FKItem_ownerId foreign key (ownerId) references User(id)
    on delete cascade,
   constraint FKItem_categoryId foreign key (categoryId) 
    references Category(id)
);

insert into User (firstName, lastName, email, password, whenRegistered, role, zip)
            VALUES ("Joe", "Admin", "adm@11.com", "password", NOW(), 1, "93401");

insert into Category (id, name) VALUES 
   (0, "Other/None"),
   (1, "Furniture"),
   (2, "Appliances"),
   (3, "Electronics"),
   (4, "Vehicles"),
   (5, "Pets/Animals"),
   (6, "Tools"),
   (7, "Art"),
   (8, "Toys/Games"),
   (9, "Jewelry"),
   (10, "Clothing"),
   (11, "Music/Instruments"),
   (12, "Sporting Equipment"),
   (13, "Services");
         
