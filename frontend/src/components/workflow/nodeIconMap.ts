// Маппинг типов узлов на SVG иконки
import ManualTriggerIcon from "../../assets/workflow/triggers/ManualTrigger.svg?react";
import WebhookTriggerIcon from "../../assets/workflow/triggers/WebhookTrigger.svg?react";
import IfIcon from "../../assets/workflow/logic/If.svg?react";
import SwitchIcon from "../../assets/workflow/logic/Switch.svg?react";
import SetIcon from "../../assets/workflow/data/Set.svg?react";
import TransformIcon from "../../assets/workflow/data/Transform.svg?react";
import CodeIcon from "../../assets/workflow/actions/Code.svg?react";
import DelayIcon from "../../assets/workflow/actions/Delay.svg?react";
import HttpRequestIcon from "../../assets/workflow/integrations/HttpRequest.svg?react";
import DbSelectIcon from "../../assets/workflow/integrations/DbSelect.svg?react";
import DbInsertIcon from "../../assets/workflow/integrations/DbInsert.svg?react";

export const nodeIconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  manual_trigger: ManualTriggerIcon,
  webhook_trigger: WebhookTriggerIcon,
  if: IfIcon,
  switch: SwitchIcon,
  set: SetIcon,
  transform: TransformIcon,
  code: CodeIcon,
  delay: DelayIcon,
  http_request: HttpRequestIcon,
  db_select: DbSelectIcon,
  db_insert: DbInsertIcon,
};

export const nodeDisplayNames: Record<string, string> = {
  manual_trigger: "Manual Trigger",
  webhook_trigger: "Webhook Trigger",
  if: "IF",
  switch: "Switch",
  set: "Set",
  transform: "Transform",
  code: "Code",
  delay: "Delay",
  http_request: "HTTP Request",
  db_select: "DB Select",
  db_insert: "DB Insert",
};
