create table student(
id char(10) not null,
nickname varchar(10) not null,
sex varchar(1),
grade varchar(2),
major varchar(10),
dormitory varchar(10) not null,
phone_number char(11) not null,
credit float(3,2) default 0,
primary key(id)
);

create table canteen(
id int(2) not null auto_increment,
canteen_name varchar(10) not null,
canteen_location varchar(20) not null,
score float(3,2) default 0,
picture varchar(30),
description varchar(200),
primary key(id)
);

create table dish(
id int(5) not null auto_increment,
dish_name varchar(10) not null,
score float(3,2) default 0,
price float(6,2) not null,
canteen_id int(2) not null,
picture varchar(30),
description varchar(200),
primary key(id),
foreign key(canteen_id) references canteen(id)
);

create table comment(
id int(8) not null auto_increment,
student_id char(10) not null,
dish_id int(5) not null,
content varchar(200),
score int(1) not null,
likes int(5) not null default 0,
time datatime not null,
primary key(id),
foreign key(student_id) references student(id),
foreign key(dish_id) references dish(id)
);

create table orderlist(
id int(8) not null auto_increment,
guest_id char(10) not null,
canteen_id int(2) not null,
totalprice float(8,2),
order_status int(1) default 0,
courier_id char(10),
order_time datetime not null,
fee float(5,2) not null,
location varchar(20) not null,
expect_time datetime not null,
arrive_time datetime,
score int(1),
primary key(id),
foreign key(guest_id) references student(id),
foreign key(courier_id) references student(id),
foreign key(canteen_id) references canteen(id)
);

create table likes(
id int(8) not null auto_increment,
student_id char(10) not null,
comment_id int(8) not null,
primary key(id),
foreign key(student_id) references student(id),
foreign key(comment_id) references comment(id)
);


create table shoppingcart(
id int(8) not null auto_increment,
order_id int(8) not null,
dish_id int(8) not null,
quantity int(2) not null,
price float(6,2),
primary key(id),
foreign key(order_id) references orderlist(id),
foreign key(dish_id) references dish(id)
);

delimiter //
CREATE TRIGGER `before_insert_shoppingcart` BEFORE INSERT ON `shoppingcart`
 FOR EACH ROW begin
declare newprice float;
select price*new.quantity into newprice from dish where id=new.dish_id;
set new.price=newprice;
end//

CREATE TRIGGER `before_update_shoppingcart` BEFORE UPDATE ON `shoppingcart`
 FOR EACH ROW begin
declare newprice float;
if old.quantity<>new.quantity then
select price*new.quantity into newprice from dish where id=new.dish_id;
set new.price=newprice;
end if;
end//

CREATE TRIGGER `after_insert_shoppingcart` AFTER INSERT ON `shoppingcart`
 FOR EACH ROW begin
declare tprice float;
select sum(price) into tprice from shoppingcart where order_id=new.order_id;
update orderlist set totalprice=tprice where id=new.order_id;
end//

CREATE TRIGGER `after_update_shoppingcart` AFTER UPDATE ON `shoppingcart`
 FOR EACH ROW begin
declare tprice float;
if old.quantity<>new.quantity then
select sum(price) into tprice from shoppingcart where order_id=new.order_id;
update orderlist set totalprice=tprice where id=new.order_id;
end if;
end//

CREATE TRIGGER `after_insert_comment` AFTER INSERT ON `comment`
 FOR EACH ROW begin
declare avgscore float;
declare c_id int;
select avg(score) into avgscore from comment where dish_id=new.dish_id;
update dish set score=avgscore where id=new.dish_id;
select canteen_id into c_id from dish where id=new.dish_id;
select avg(score) into avgscore from dish where canteen_id=c_id and score<>0;
update canteen set score=avgscore where id=c_id;
end//

CREATE TRIGGER `after_update_comment` AFTER UPDATE ON `comment`
 FOR EACH ROW begin
declare avgscore float;
declare c_id int;
select avg(score) into avgscore from comment where dish_id=new.dish_id;
update dish set score=avgscore where id=new.dish_id;
select canteen_id into c_id from dish where id=new.dish_id;
select avg(score) into avgscore from dish where canteen_id=c_id and score<>0;
update canteen set score=avgscore where id=c_id;
end//

CREATE TRIGGER `after_delete_comment` AFTER DELETE ON `comment`
 FOR EACH ROW begin
declare avgscore float;
declare c_id int;
select avg(score) into avgscore from comment where dish_id=old.dish_id;
update dish set score=avgscore where id=old.dish_id;
select canteen_id into c_id from dish where id=old.dish_id;
select avg(score) into avgscore from dish where canteen_id=c_id and score<>0;
update canteen set score=avgscore where id=c_id;
end//

CREATE TRIGGER `after_insert_orderlist` AFTER INSERT ON `orderlist`
 FOR EACH ROW begin
declare avgscore float;
if new.order_status = 2 then
select avg(score) into avgscore from orderlist where courier_id=new.courier_id and order_status>2;
update student set score=avgscore where id=new.courier_id;
end if;
end//

CREATE TRIGGER `after_update_orderlist` AFTER UPDATE ON `orderlist`
 FOR EACH ROW begin
declare avgscore float;
if new.order_status = 2 then
select avg(score) into avgscore from orderlist where courier_id=new.courier_id and order_status>2;
update student set score=avgscore where id=new.courier_id;
end if;
end//

CREATE TRIGGER `after_delete_orderlist` AFTER DELETE ON `orderlist`
 FOR EACH ROW begin
declare avgscore float;
if old.order_status = 2 then
select avg(score) into avgscore from orderlist where courier_id=old.courier_id and order_status>2;
update student set score=avgscore where id=old.courier_id;
end if;
end//

CREATE TRIGGER `after_insert_likes` AFTER INSERT ON `likes`
 FOR EACH ROW begin
update comment set likes=likes+1 where id=new.comment_id;
end//

CREATE TRIGGER `after_update_likes` AFTER UPDATE ON `likes`
 FOR EACH ROW begin
update comment set likes=likes-1 where id=old.comment_id;
update comment set likes=likes+1 where id=new.comment_id;
end//

CREATE TRIGGER `after_delete_likes` AFTER DELETE ON `likes`
 FOR EACH ROW begin
update comment set likes=likes-1 where id=old.comment_id;
end//

CREATE PROCEDURE `add_orderlist`(IN `guestid` CHAR(10), IN `canteenid` INT(2),  IN `f` FLOAT(5,2), IN `loc` VARCHAR(20), IN `expect` INT(4) ,IN `nowTime` datetime)
    NO SQL
begin
declare expect_t datetime;
set expect_t = DATE_ADD(nowTime,interval expect minute);
insert into orderlist values(null,guestid,canteenid,0,0,null,nowTime,f,loc,expect_t,null,null);
end//

create PROCEDURE getCommentInfo(in dish_id int(5)) begin
  select 
    c.id id,
    c.student_id student_id,
    s.nickname student_name,
    c.dish_id dish_id,
    c.content content,
    c.score score,
    c.likes likes,
    c.time time
  from comment c,student s where c.student_id=s.id and c.dish_id=dish_id order by c.likes desc,c.id;
end//

create PROCEDURE getDishInfo(in orderlistid int(8)) begin
  select 
    d.dish_name dishName,
    s.quantity qty
  from shoppingcart s,dish d where s.dish_id=d.id and s.order_id=orderlistid;
end//

delimiter ;