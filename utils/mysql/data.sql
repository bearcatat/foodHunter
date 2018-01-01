insert into canteen(canteen_name,canteen_location,score,picture) value('南区饭堂一楼','南区',0,'canteen.jpg');
insert into canteen(canteen_name,canteen_location,score,picture) value('南区饭堂二楼','南区',0,'canteen.jpg');
insert into canteen(canteen_name,canteen_location,score,picture) value('南区饭堂三楼','南区',0,'canteen.jpg');

insert into dish(dish_name,score,price,canteen_id,picture,description) value('油封鲑鱼',0,59,1,'food1_1.jpg','鱼肉闪耀着光泽，炙烤过的培根肉脂香味扑鼻而来，内测那柔软温润的口感，让人几乎分不清它到底是生是熟，而表面又用「沙罗曼达」烤出了扑鼻的香味，配菜是不加砂糖用冷冻粉碎机把鲑鱼粉碎成口感细腻的鱼泥做出来的鲑鱼冰淇淋');
insert into dish(dish_name,score,price,canteen_id,picture,description) value('鲑鱼烤饼',0,69,1,'food1_2.jpg','把鲑鱼和米等材料用布里欧修面团包起来烤，是一道发祥自19世纪俄国宫廷的法式料理，会加入蘑菇 香葱等蔬菜以及谷物作为内陷，并用了黄油饭和东欧一带食用的用荞麦米炒制而成的「卡沙」，表面粗糙但是想为浓郁的面团 配上鲑鱼的香气，美味多汁');

insert into dish(dish_name,score,price,canteen_id,picture,description) value('海南鸡饭',0,59,2,'food2_1.jpg','这道菜品还有「Khao Man Kai」「新加坡鸡饭」等各种各样的称呼，是东南亚一带备受喜爱的经典菜品，既细腻又澎湃的鲜味，煮的恰到好处的柔嫩鸡肉，充分保留了萨摩土鸡的上等风味');
insert into dish(dish_name,score,price,canteen_id,picture,description) value('鸡翅包饭',0,69,2,'food2_2.jpg','在土鸡高汤里加入了酱油、酒、醋、砂糖、芝麻油以及番茄酱调制而成了特制的糖醋芡汁， 通过加入番茄酱的酸味，得以将猪颈肉和帕玛森芝士的醇厚多汁保留下来，同时又凸显了土鸡原有的上等余味，由于番茄富含鲜味成分谷氨酸，搭配帕玛森芝士可以说是无可挑剔，而且跟土鸡和香菇的鲜味成分组合在了一起，便能发挥相乘的作用');

insert into dish(dish_name,score,price,canteen_id,picture,description) value('阿比修斯风鸭肉',0,78,3,'food3_1.jpg','据传是罗马美食家阿比修斯所钟爱的一道美食，焦糖状的蜂蜜闪着鲜亮色泽，涂满一整面鸭肉的香辛料散发着诱人香味，贯穿全身的奢华而又辛辣的芳香，就算咀嚼下去了，那股香味依旧久久蔓延在鼻腔和口腔内，蕴含的香辛料的特性数不胜数，有刺激的辣味，也有微微的甘甜，有清爽的清凉感，也有厚重的涩味，在这道料理中自如地掌控好了这些力量的平衡');
insert into dish(dish_name,score,price,canteen_id,picture,description) value('法式炖鳗鱼',0,68,3,'food3_2.jpg','经过充分炖煮之后非常送软，在煎烤前用肉桂和红酒腌渍过，增添了一层清爽的风味，用泡发后的洋李用鳗鱼包裹起来，使得鳗鱼那柔软滑嫩的肉脂中，不断有洋李的浓郁果酸满溢开来，再用网油覆盖表层，土豆泥那种粘稠的口感，再加上松松软软的奶油面包，还有鳗鱼的甘美肉脂和洋李的酸味在口中横冲直撞，所有的味道浑然一体');

call add_orderlist(2015150000,1,'{"1":1}',1,'adress001',30);

drop PROCEDURE getCommentInfo;
delimiter //
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
delimiter ;

DROP TRIGGER IF EXISTS `after_delete_orderlist`;
DROP TRIGGER IF EXISTS `after_insert_orderlist`;
DROP TRIGGER IF EXISTS `after_update_orderlist`;
delimiter //
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
delimiter ;