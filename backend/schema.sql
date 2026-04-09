  --
  -- PostgreSQL database dump
  --

  \restrict PscsgocCwLilnmOaRDIP5NExHASfq8MRb0HVzEcBLer9PmVbbF5onFn61YkiUfc

  -- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
  -- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

  SET statement_timeout = 0;
  SET lock_timeout = 0;
  SET idle_in_transaction_session_timeout = 0;
  SET client_encoding = 'UTF8';
  SET standard_conforming_strings = on;
  SELECT pg_catalog.set_config('search_path', '', false);
  SET check_function_bodies = false;
  SET xmloption = content;
  SET client_min_messages = warning;
  SET row_security = off;

  --
  -- Name: public; Type: SCHEMA; Schema: -; Owner: -
  --

  -- *not* creating schema, since initdb creates it


  --
  -- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
  --

  COMMENT ON SCHEMA public IS '';


  --
  -- Name: ExecutionStatus; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."ExecutionStatus" AS ENUM (
      'queued',
      'running',
      'success',
      'failed',
      'cancelled'
  );


  --
  -- Name: NodeCategory; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."NodeCategory" AS ENUM (
      'trigger',
      'action',
      'logic',
      'data',
      'integration'
  );


  --
  -- Name: NodeExecutionStatus; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."NodeExecutionStatus" AS ENUM (
      'pending',
      'running',
      'success',
      'failed',
      'skipped'
  );


  --
  -- Name: ProjectMemberRole; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."ProjectMemberRole" AS ENUM (
      'OWNER',
      'EDITOR',
      'VIEWER'
  );


  --
  -- Name: Role; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."Role" AS ENUM (
      'USER',
      'SUPER_ADMIN'
  );


  --
  -- Name: ShareAccessType; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."ShareAccessType" AS ENUM (
      'view',
      'comment',
      'edit'
  );


  --
  -- Name: TriggerType; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."TriggerType" AS ENUM (
      'manual',
      'webhook',
      'schedule',
      'system'
  );


  --
  -- Name: WorkflowStatus; Type: TYPE; Schema: public; Owner: -
  --

  CREATE TYPE public."WorkflowStatus" AS ENUM (
      'draft',
      'active',
      'inactive',
      'archived'
  );


  SET default_tablespace = '';

  SET default_table_access_method = heap;

  --
  -- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public._prisma_migrations (
      id character varying(36) NOT NULL,
      checksum character varying(64) NOT NULL,
      finished_at timestamp with time zone,
      migration_name character varying(255) NOT NULL,
      logs text,
      rolled_back_at timestamp with time zone,
      started_at timestamp with time zone DEFAULT now() NOT NULL,
      applied_steps_count integer DEFAULT 0 NOT NULL
  );


  --
  -- Name: credentials; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.credentials (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      user_id uuid NOT NULL,
      type character varying(100) NOT NULL,
      name character varying(255) NOT NULL,
      encrypted_data jsonb NOT NULL,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: execution_node_logs; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.execution_node_logs (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      execution_id uuid NOT NULL,
      node_id uuid,
      status public."NodeExecutionStatus" NOT NULL,
      started_at timestamp(3) without time zone,
      finished_at timestamp(3) without time zone,
      input_json jsonb,
      output_json jsonb,
      error_message text
  );


  --
  -- Name: node_types; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.node_types (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      code character varying(100) NOT NULL,
      display_name character varying(255) NOT NULL,
      category public."NodeCategory" NOT NULL,
      description text,
      icon character varying(255),
      is_trigger boolean DEFAULT false NOT NULL,
      supports_credentials boolean DEFAULT false NOT NULL,
      schema_json jsonb,
      default_config_json jsonb DEFAULT '{}'::jsonb NOT NULL,
      is_active boolean DEFAULT true NOT NULL,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: project_members; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.project_members (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      project_id uuid NOT NULL,
      user_id uuid NOT NULL,
      role public."ProjectMemberRole" NOT NULL,
      invited_by uuid,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
  );


  --
  -- Name: projects; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.projects (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      owner_id uuid NOT NULL,
      name text NOT NULL,
      description character varying(255),
      is_archived boolean DEFAULT false NOT NULL,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.user_profiles (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      user_id uuid NOT NULL,
      first_name text,
      last_name text,
      bio text,
      phone text,
      avatar_url text,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: users; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.users (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      username text,
      email text NOT NULL,
      password_hash text NOT NULL,
      role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: workflow_edges; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.workflow_edges (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      workflow_id uuid NOT NULL,
      source_node_id uuid NOT NULL,
      target_node_id uuid NOT NULL,
      source_handle character varying(100),
      target_handle character varying(100),
      condition_type character varying(50),
      label character varying(255),
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
  );


  --
  -- Name: workflow_executions; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.workflow_executions (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      workflow_id uuid NOT NULL,
      started_by_user_id uuid,
      trigger_type public."TriggerType" NOT NULL,
      status public."ExecutionStatus" DEFAULT 'queued'::public."ExecutionStatus" NOT NULL,
      started_at timestamp(3) without time zone,
      finished_at timestamp(3) without time zone,
      input_data_json jsonb,
      output_data_json jsonb,
      error_message text
  );


  --
  -- Name: workflow_nodes; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.workflow_nodes (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      workflow_id uuid NOT NULL,
      node_type_id uuid,
      type character varying(100) NOT NULL,
      name character varying(255),
      label character varying(255),
      pos_x double precision NOT NULL,
      pos_y double precision NOT NULL,
      config_json jsonb DEFAULT '{}'::jsonb NOT NULL,
      credentials_id uuid,
      notes text,
      is_disabled boolean DEFAULT false NOT NULL,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: workflow_shares; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.workflow_shares (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      workflow_id uuid NOT NULL,
      token character varying(255) NOT NULL,
      access_type public."ShareAccessType" DEFAULT 'view'::public."ShareAccessType" NOT NULL,
      expires_at timestamp(3) without time zone,
      created_by uuid,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
  );


  --
  -- Name: workflows; Type: TABLE; Schema: public; Owner: -
  --

  CREATE TABLE public.workflows (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      "projectId" uuid NOT NULL,
      "createdBy" uuid,
      name text NOT NULL,
      description text,
      status text DEFAULT 'draft'::text NOT NULL,
      version integer DEFAULT 1 NOT NULL,
      "isPublic" boolean DEFAULT false NOT NULL,
      created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp(3) without time zone NOT NULL
  );


  --
  -- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public._prisma_migrations
      ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


  --
  -- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.credentials
      ADD CONSTRAINT credentials_pkey PRIMARY KEY (id);


  --
  -- Name: execution_node_logs execution_node_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.execution_node_logs
      ADD CONSTRAINT execution_node_logs_pkey PRIMARY KEY (id);


  --
  -- Name: node_types node_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.node_types
      ADD CONSTRAINT node_types_pkey PRIMARY KEY (id);


  --
  -- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.project_members
      ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


  --
  -- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.projects
      ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


  --
  -- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.user_profiles
      ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


  --
  -- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.users
      ADD CONSTRAINT users_pkey PRIMARY KEY (id);


  --
  -- Name: workflow_edges workflow_edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_edges
      ADD CONSTRAINT workflow_edges_pkey PRIMARY KEY (id);


  --
  -- Name: workflow_executions workflow_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_executions
      ADD CONSTRAINT workflow_executions_pkey PRIMARY KEY (id);


  --
  -- Name: workflow_nodes workflow_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_nodes
      ADD CONSTRAINT workflow_nodes_pkey PRIMARY KEY (id);


  --
  -- Name: workflow_shares workflow_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_shares
      ADD CONSTRAINT workflow_shares_pkey PRIMARY KEY (id);


  --
  -- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflows
      ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


  --
  -- Name: credentials_type_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX credentials_type_idx ON public.credentials USING btree (type);


  --
  -- Name: credentials_user_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX credentials_user_id_idx ON public.credentials USING btree (user_id);


  --
  -- Name: execution_node_logs_execution_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX execution_node_logs_execution_id_idx ON public.execution_node_logs USING btree (execution_id);


  --
  -- Name: execution_node_logs_node_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX execution_node_logs_node_id_idx ON public.execution_node_logs USING btree (node_id);


  --
  -- Name: execution_node_logs_status_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX execution_node_logs_status_idx ON public.execution_node_logs USING btree (status);


  --
  -- Name: node_types_category_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX node_types_category_idx ON public.node_types USING btree (category);


  --
  -- Name: node_types_code_key; Type: INDEX; Schema: public; Owner: -
  --

  CREATE UNIQUE INDEX node_types_code_key ON public.node_types USING btree (code);


  --
  -- Name: node_types_is_active_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX node_types_is_active_idx ON public.node_types USING btree (is_active);


  --
  -- Name: project_members_project_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX project_members_project_id_idx ON public.project_members USING btree (project_id);


  --
  -- Name: project_members_project_id_user_id_key; Type: INDEX; Schema: public; Owner: -
  --

  CREATE UNIQUE INDEX project_members_project_id_user_id_key ON public.project_members USING btree (project_id, user_id);


  --
  -- Name: project_members_user_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX project_members_user_id_idx ON public.project_members USING btree (user_id);


  --
  -- Name: user_profiles_user_id_key; Type: INDEX; Schema: public; Owner: -
  --

  CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);


  --
  -- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
  --

  CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


  --
  -- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
  --

  CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


  --
  -- Name: workflow_edges_source_node_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_edges_source_node_id_idx ON public.workflow_edges USING btree (source_node_id);


  --
  -- Name: workflow_edges_target_node_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_edges_target_node_id_idx ON public.workflow_edges USING btree (target_node_id);


  --
  -- Name: workflow_edges_workflow_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_edges_workflow_id_idx ON public.workflow_edges USING btree (workflow_id);


  --
  -- Name: workflow_executions_started_by_user_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_executions_started_by_user_id_idx ON public.workflow_executions USING btree (started_by_user_id);


  --
  -- Name: workflow_executions_status_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_executions_status_idx ON public.workflow_executions USING btree (status);


  --
  -- Name: workflow_executions_workflow_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_executions_workflow_id_idx ON public.workflow_executions USING btree (workflow_id);


  --
  -- Name: workflow_nodes_credentials_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_nodes_credentials_id_idx ON public.workflow_nodes USING btree (credentials_id);


  --
  -- Name: workflow_nodes_node_type_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_nodes_node_type_id_idx ON public.workflow_nodes USING btree (node_type_id);


  --
  -- Name: workflow_nodes_type_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_nodes_type_idx ON public.workflow_nodes USING btree (type);


  --
  -- Name: workflow_nodes_workflow_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_nodes_workflow_id_idx ON public.workflow_nodes USING btree (workflow_id);


  --
  -- Name: workflow_shares_expires_at_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_shares_expires_at_idx ON public.workflow_shares USING btree (expires_at);


  --
  -- Name: workflow_shares_token_key; Type: INDEX; Schema: public; Owner: -
  --

  CREATE UNIQUE INDEX workflow_shares_token_key ON public.workflow_shares USING btree (token);


  --
  -- Name: workflow_shares_workflow_id_idx; Type: INDEX; Schema: public; Owner: -
  --

  CREATE INDEX workflow_shares_workflow_id_idx ON public.workflow_shares USING btree (workflow_id);


  --
  -- Name: credentials credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.credentials
      ADD CONSTRAINT credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: execution_node_logs execution_node_logs_execution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.execution_node_logs
      ADD CONSTRAINT execution_node_logs_execution_id_fkey FOREIGN KEY (execution_id) REFERENCES public.workflow_executions(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: execution_node_logs execution_node_logs_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.execution_node_logs
      ADD CONSTRAINT execution_node_logs_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.workflow_nodes(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: project_members project_members_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.project_members
      ADD CONSTRAINT project_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: project_members project_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.project_members
      ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: project_members project_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.project_members
      ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: projects projects_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.projects
      ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


  --
  -- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.user_profiles
      ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


  --
  -- Name: workflow_edges workflow_edges_source_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_edges
      ADD CONSTRAINT workflow_edges_source_node_id_fkey FOREIGN KEY (source_node_id) REFERENCES public.workflow_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: workflow_edges workflow_edges_target_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_edges
      ADD CONSTRAINT workflow_edges_target_node_id_fkey FOREIGN KEY (target_node_id) REFERENCES public.workflow_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: workflow_edges workflow_edges_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_edges
      ADD CONSTRAINT workflow_edges_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: workflow_executions workflow_executions_started_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_executions
      ADD CONSTRAINT workflow_executions_started_by_user_id_fkey FOREIGN KEY (started_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: workflow_executions workflow_executions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_executions
      ADD CONSTRAINT workflow_executions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: workflow_nodes workflow_nodes_credentials_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_nodes
      ADD CONSTRAINT workflow_nodes_credentials_id_fkey FOREIGN KEY (credentials_id) REFERENCES public.credentials(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: workflow_nodes workflow_nodes_node_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_nodes
      ADD CONSTRAINT workflow_nodes_node_type_id_fkey FOREIGN KEY (node_type_id) REFERENCES public.node_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: workflow_nodes workflow_nodes_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_nodes
      ADD CONSTRAINT workflow_nodes_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: workflow_shares workflow_shares_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_shares
      ADD CONSTRAINT workflow_shares_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: workflow_shares workflow_shares_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflow_shares
      ADD CONSTRAINT workflow_shares_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE CASCADE;


  --
  -- Name: workflows workflows_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflows
      ADD CONSTRAINT "workflows_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


  --
  -- Name: workflows workflows_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
  --

  ALTER TABLE ONLY public.workflows
      ADD CONSTRAINT "workflows_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


  --
  -- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
  --

  REVOKE USAGE ON SCHEMA public FROM PUBLIC;


  --
  -- PostgreSQL database dump complete
  --

  \unrestrict PscsgocCwLilnmOaRDIP5NExHASfq8MRb0HVzEcBLer9PmVbbF5onFn61YkiUfc

