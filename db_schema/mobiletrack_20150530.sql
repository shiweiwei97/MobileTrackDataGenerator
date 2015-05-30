#
# SQL Export
# Created by Querious (980)
# Created: 2015年5月30日 GMT+8下午9:52:28
# Encoding: Unicode (UTF-8)
#

DROP DATABASE IF EXISTS `mobiletrack`;
CREATE DATABASE `mobiletrack` /*!40100 DEFAULT CHARACTER SET utf8 */
use `mobiletrack`;

DROP TABLE IF EXISTS `pageviews`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `devices`;
DROP TABLE IF EXISTS `apps`;


CREATE TABLE `apps` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `app_key` varchar(50) NOT NULL DEFAULT '',
  `app_version` varchar(50) NOT NULL,
  `sdk_version` varchar(50) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_key_version` (`app_key`,`app_version`)
) ENGINE=InnoDB AUTO_INCREMENT=1788 DEFAULT CHARSET=utf8;


CREATE TABLE `devices` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(50) NOT NULL DEFAULT '',
  `model` varchar(50) NOT NULL DEFAULT '',
  `name` varchar(255) DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_uuid` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=2133 DEFAULT CHARSET=utf8;


CREATE TABLE `sessions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(50) NOT NULL,
  `device_id` int(11) unsigned NOT NULL,
  `app_id` int(11) unsigned NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `duration` int(11) NOT NULL,
  `page_count` int(11) NOT NULL,
  `event_count` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_uuid` (`uuid`),
  KEY `fk_session_app_id` (`app_id`),
  KEY `fk_session_device_id` (`device_id`),
  FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`),
  FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1451 DEFAULT CHARSET=utf8;


CREATE TABLE `events` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `device_id` int(11) unsigned NOT NULL,
  `app_id` int(11) unsigned NOT NULL,
  `session_id` int(11) unsigned NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '',
  `label` varchar(255) NOT NULL DEFAULT '',
  `key` varchar(50) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `duration` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `attr_key_1` varchar(50) DEFAULT NULL,
  `attr_val_1` varchar(50) DEFAULT NULL,
  `attr_key_2` varchar(50) DEFAULT NULL,
  `attr_val_2` varchar(50) DEFAULT NULL,
  `attr_key_3` varchar(50) DEFAULT NULL,
  `attr_val_3` varchar(50) DEFAULT NULL,
  `attr_key_4` varchar(50) DEFAULT NULL,
  `attr_val_4` varchar(50) DEFAULT NULL,
  `attr_key_5` varchar(50) DEFAULT NULL,
  `attr_val_5` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_evt_app_id` (`app_id`),
  KEY `fk_evt_device_id` (`device_id`),
  KEY `fk_evt_session_id` (`session_id`),
  FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`),
  FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2413 DEFAULT CHARSET=utf8;


CREATE TABLE `pageviews` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `device_id` int(11) unsigned NOT NULL,
  `app_id` int(11) unsigned NOT NULL,
  `session_id` int(11) unsigned NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '',
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `duration` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pv_device_id` (`device_id`),
  KEY `fk_pv_session_id` (`session_id`),
  KEY `fk_pv_app_id` (`app_id`),
  FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`),
  FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2287 DEFAULT CHARSET=utf8;


ALTER TABLE `pageviews` AUTO_INCREMENT = 1;
ALTER TABLE `events` AUTO_INCREMENT = 1;
ALTER TABLE `sessions` AUTO_INCREMENT = 1;
ALTER TABLE `devices` AUTO_INCREMENT = 1;
ALTER TABLE `apps` AUTO_INCREMENT = 1;
