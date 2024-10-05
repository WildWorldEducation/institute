CREATE DATABASE `skill_tree` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;

-- MariaDB dump 10.19  Distrib 10.6.16-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: skill_tree
-- ------------------------------------------------------
-- Server version       10.6.16-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blacklisted_sources`
--

DROP TABLE IF EXISTS `blacklisted_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blacklisted_sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `root_domain` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`root_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cohort_skill_filters`
--

DROP TABLE IF EXISTS `cohort_skill_filters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cohort_skill_filters` (
  `cohort_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  PRIMARY KEY (`cohort_id`,`skill_id`),
  UNIQUE KEY `cohort_skill_filter_UNIQUE` (`cohort_id`,`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cohorts`
--

DROP TABLE IF EXISTS `cohorts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cohorts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `instructor_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cohorts_users`
--

DROP TABLE IF EXISTS `cohorts_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cohorts_users` (
  `cohort_id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`cohort_id`,`user_id`),
  UNIQUE KEY `cohort_user_UNIQUE` (`cohort_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `content_flags`
--

DROP TABLE IF EXISTS `content_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `content_flags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content_type` enum('skill','mc_question','resource','essay_question','tutor_post','image_question') NOT NULL,
  `content_id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `UNIQUE` (`content_type`,`content_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `essay_questions`
--

DROP TABLE IF EXISTS `essay_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `essay_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `question` varchar(500) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `essay_questions_awaiting_approval`
--

DROP TABLE IF EXISTS `essay_questions_awaiting_approval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `essay_questions_awaiting_approval` (
  `essay_question_id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `name` varchar(45) NOT NULL,
  `question` varchar(500) NOT NULL,
  `comment` text DEFAULT NULL,
  PRIMARY KEY (`essay_question_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `image_questions`
--

DROP TABLE IF EXISTS `image_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `image_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `question` varchar(500) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `num_images_required` int(11) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `image_questions_awaiting_approval`
--

DROP TABLE IF EXISTS `image_questions_awaiting_approval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `image_questions_awaiting_approval` (
  `image_question_id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `name` varchar(45) NOT NULL,
  `question` varchar(500) NOT NULL,
  `num_images_required` int(11) NOT NULL DEFAULT 1,
  `comment` text DEFAULT NULL,
  PRIMARY KEY (`image_question_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `instructor_students`
--

DROP TABLE IF EXISTS `instructor_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instructor_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instructor_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mc_questions`
--

DROP TABLE IF EXISTS `mc_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mc_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `question` varchar(500) NOT NULL,
  `correct_answer` varchar(500) NOT NULL,
  `incorrect_answer_1` varchar(500) NOT NULL,
  `incorrect_answer_2` varchar(500) NOT NULL,
  `incorrect_answer_3` varchar(500) NOT NULL,
  `incorrect_answer_4` varchar(200) NOT NULL,
  `explanation` varchar(1000) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `is_checked` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mc_questions_awaiting_approval`
--

DROP TABLE IF EXISTS `mc_questions_awaiting_approval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mc_questions_awaiting_approval` (
  `mc_question_id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `name` varchar(255) NOT NULL,
  `question` varchar(500) NOT NULL,
  `correct_answer` varchar(500) NOT NULL,
  `incorrect_answer_1` varchar(500) NOT NULL,
  `incorrect_answer_2` varchar(500) NOT NULL,
  `incorrect_answer_3` varchar(500) NOT NULL,
  `incorrect_answer_4` varchar(200) NOT NULL,
  `explanation` varchar(1000) NOT NULL,
  `comment` text DEFAULT NULL,
  PRIMARY KEY (`mc_question_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `news_1` text NOT NULL DEFAULT '""',
  `news_2` text NOT NULL DEFAULT '""',
  `news_3` text NOT NULL DEFAULT '""',
  `news_4` text NOT NULL DEFAULT '""',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_1` text NOT NULL DEFAULT '""',
  `notification_2` text NOT NULL DEFAULT '""',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `content` longtext DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skill_degradation_days` int(11) NOT NULL DEFAULT 180,
  `quiz_max_questions` int(11) NOT NULL DEFAULT 30,
  `is_manual_essay_marking` tinyint(1) NOT NULL,
  `pass_mark` int(11) NOT NULL DEFAULT 80,
  `todo_skill_table_rows` int(11) NOT NULL DEFAULT 25,
  `todo_mc_question_table_rows` int(11) NOT NULL DEFAULT 25,
  `todo_essay_question_table_rows` int(11) NOT NULL DEFAULT 25,
  `todo_image_question_table_rows` int(11) NOT NULL DEFAULT 25,
  `todo_content_flag_table_rows` int(11) NOT NULL DEFAULT 25,
  `todo_student_question_table_rows` int(11) NOT NULL DEFAULT 25,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skill_history`
--

DROP TABLE IF EXISTS `skill_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skill_history` (
  `id` int(11) NOT NULL,
  `version_number` int(11) NOT NULL DEFAULT 1,
  `user_id` varchar(36) NOT NULL,
  `edited_date` datetime NOT NULL DEFAULT current_timestamp(),
  `name` text NOT NULL,
  `description` text DEFAULT NULL,
  `icon_image` mediumtext DEFAULT NULL,
  `banner_image` mediumtext DEFAULT NULL,
  `mastery_requirements` mediumtext DEFAULT NULL,
  `level` enum('grade_school','middle_school','high_school','college','phd','domain') NOT NULL DEFAULT 'grade_school',
  `order` int(11) NOT NULL DEFAULT 0,
  `comment` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`,`version_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skill_tags`
--

DROP TABLE IF EXISTS `skill_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skill_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skill_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `url` text NOT NULL,
  `parent` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `icon_image` mediumtext DEFAULT NULL,
  `banner_image` mediumtext DEFAULT NULL,
  `mastery_requirements` mediumtext DEFAULT NULL,
  `type` enum('regular','super','sub','domain') NOT NULL,
  `level` enum('grade_school','middle_school','high_school','college','phd','domain') NOT NULL DEFAULT 'grade_school',
  `is_filtered` enum('available','filtered') NOT NULL DEFAULT 'available',
  `order` int(11) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `version_number` int(11) NOT NULL DEFAULT 1,
  `edited_date` datetime NOT NULL DEFAULT current_timestamp(),
  `is_copy_of_skill_id` int(11) DEFAULT NULL,
  `display_name` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=4073 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skills_awaiting_approval`
--

DROP TABLE IF EXISTS `skills_awaiting_approval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skills_awaiting_approval` (
  `skill_id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `mastery_requirements` mediumtext DEFAULT NULL,
  `banner_image` mediumtext DEFAULT NULL,
  `icon_image` mediumtext DEFAULT NULL,
  `comment` text DEFAULT NULL,
  PRIMARY KEY (`skill_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_mc_questions`
--

DROP TABLE IF EXISTS `student_mc_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_mc_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(500) NOT NULL,
  `correct_answer` varchar(500) NOT NULL,
  `incorrect_answer_1` varchar(500) NOT NULL,
  `incorrect_answer_2` varchar(500) NOT NULL,
  `incorrect_answer_3` varchar(500) NOT NULL,
  `incorrect_answer_4` varchar(500) NOT NULL,
  `explanation` varchar(1000) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `is_active` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tutor_posts`
--

DROP TABLE IF EXISTS `tutor_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutor_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `description` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tutor_votes`
--

DROP TABLE IF EXISTS `tutor_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutor_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `tutor_post_id` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`user_id`,`tutor_post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unmarked_assessments`
--

DROP TABLE IF EXISTS `unmarked_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unmarked_assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(36) NOT NULL,
  `total_score` int(11) NOT NULL,
  `current_score` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `skill_id` int(11) NOT NULL,
  `num_unmarked_questions_remaining` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unmarked_essay_answers`
--

DROP TABLE IF EXISTS `unmarked_essay_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unmarked_essay_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_id` int(11) NOT NULL,
  `answer` mediumtext DEFAULT NULL,
  `question_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unmarked_image_answers`
--

DROP TABLE IF EXISTS `unmarked_image_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unmarked_image_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_id` int(11) NOT NULL,
  `answer_1` mediumtext NOT NULL DEFAULT '',
  `answer_2` mediumtext DEFAULT NULL,
  `answer_3` mediumtext DEFAULT NULL,
  `answer_4` mediumtext DEFAULT NULL,
  `answer_5` mediumtext DEFAULT NULL,
  `question_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_actions`
--

DROP TABLE IF EXISTS `user_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `action` enum('create','update','delete','bulk-create','bulk-delete','submit_update_for_review','edit_and_approve','approve','dismiss-edit') NOT NULL,
  `content_id` int(11) NOT NULL DEFAULT 0,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `content_type` enum('content_flag','resource','student_mc_question','skill','mc_question','essay_question','image_question') NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_skills`
--

DROP TABLE IF EXISTS `user_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_skills` (
  `user_id` varchar(36) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `is_mastered` tinyint(1) DEFAULT NULL,
  `is_accessible` tinyint(1) DEFAULT NULL,
  `show_children` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`skill_id`),
  UNIQUE KEY `user_skills_unique` (`user_id`,`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_visited_skills`
--

DROP TABLE IF EXISTS `user_visited_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_visited_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `visited_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_user_visited_skills_userId_skill_id` (`user_id`,`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_votes`
--

DROP TABLE IF EXISTS `user_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`user_id`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `first_name` text DEFAULT NULL,
  `last_name` text DEFAULT NULL,
  `username` varchar(90) NOT NULL,
  `password` varchar(200) DEFAULT NULL,
  `avatar` mediumtext DEFAULT '',
  `email` varchar(319) NOT NULL,
  `role` enum('admin','instructor','student','editor') NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whitelisted_sources`
--

DROP TABLE IF EXISTS `whitelisted_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `whitelisted_sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `root_domain` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`root_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;