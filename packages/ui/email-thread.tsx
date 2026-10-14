import * as React from "react";
import { Avatar, AvatarFallback } from "./avatar.js";
import { cn } from "./classes.js";

export type EmailParticipant = { name?: string; address?: string };

function EmailIdentity({ name, address }: EmailParticipant) {
  return (
    <span data-slot="email-identity" className="labui:[overflow-wrap:anywhere]">
      <bdi className="labui:font-medium labui:text-foreground">
        {name || address || "Unknown sender"}
      </bdi>
      {name && address && name !== address && (
        <>
          {" "}
          <bdi className="labui:font-normal labui:text-muted-foreground">
            &lt;{address}&gt;
          </bdi>
        </>
      )}
    </span>
  );
}

const EmailThread = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(function EmailThread({ className, ...props }, ref) {
  return (
    <ol
      ref={ref}
      data-slot="email-thread"
      className={cn("labui:min-w-0 labui:list-none", className)}
      {...props}
    />
  );
});

const messageTones = {
  default: "",
  muted: "labui:bg-muted/25",
  warning: "labui:border-warning/25 labui:bg-warning/5",
};

export type EmailMessageProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "children"
> & {
  sender: EmailParticipant;
  recipient?: EmailParticipant;
  attribution?: React.ReactNode;
  dateTime?: string;
  dateLabel: string;
  badge?: React.ReactNode;
  tone?: keyof typeof messageTones;
  body: string;
  attachments?: React.ReactNode;
};

const initials = (participant: EmailParticipant) =>
  (participant.name || participant.address || "?").slice(0, 2).toUpperCase();

const EmailMessage = React.forwardRef<HTMLLIElement, EmailMessageProps>(
  function EmailMessage(
    {
      sender,
      recipient,
      attribution,
      dateTime,
      dateLabel,
      badge,
      tone = "default",
      body,
      attachments,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <li
        ref={ref}
        data-slot="email-message"
        className={cn(
          "labui:group/message labui:relative labui:flex labui:min-w-0 labui:gap-3 labui:pb-6 labui:last:pb-0 labui:sm:gap-4",
          className,
        )}
        {...props}
      >
        <div className="labui:relative labui:flex labui:shrink-0 labui:flex-col labui:items-center">
          <Avatar
            aria-hidden="true"
            className="labui:z-10 labui:size-9 labui:ring-4 labui:ring-background"
          >
            <AvatarFallback
              className={cn(
                "labui:text-xs labui:font-semibold",
                tone === "warning" && "labui:bg-warning/10 labui:text-warning",
              )}
            >
              {initials(sender)}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden="true"
            className="labui:absolute labui:top-10 labui:-bottom-6 labui:w-px labui:bg-border labui:group-last/message:hidden"
          />
        </div>
        <article
          className={cn(
            "labui:min-w-0 labui:flex-1 labui:overflow-hidden labui:rounded-lg labui:border labui:bg-card",
            messageTones[tone],
          )}
        >
          <header className="labui:flex labui:flex-wrap labui:items-start labui:justify-between labui:gap-x-5 labui:gap-y-2 labui:border-b labui:border-border/60 labui:px-4 labui:py-3 labui:sm:px-5">
            <div className="labui:flex labui:min-w-0 labui:flex-1 labui:flex-col labui:gap-1 labui:text-sm">
              <EmailIdentity {...sender} />
              {(recipient || attribution) && (
                <div className="labui:flex labui:flex-wrap labui:gap-x-3 labui:gap-y-1 labui:text-xs labui:text-muted-foreground">
                  {recipient && (
                    <span>
                      To <EmailIdentity {...recipient} />
                    </span>
                  )}
                  {attribution && (
                    <span className="labui:[overflow-wrap:anywhere]">
                      {attribution}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="labui:flex labui:flex-wrap labui:items-center labui:gap-2 labui:text-xs labui:text-muted-foreground">
              {badge}
              <time dateTime={dateTime} className="labui:tabular-nums">
                {dateLabel}
              </time>
            </div>
          </header>
          <div className="labui:px-4 labui:py-4 labui:sm:px-5">
            <div
              data-slot="email-body"
              className="labui:text-sm labui:leading-7 labui:whitespace-pre-wrap labui:[overflow-wrap:anywhere]"
            >
              {body}
            </div>
            {attachments && (
              <div
                data-slot="email-attachments"
                className="labui:mt-4 labui:flex labui:flex-wrap labui:gap-2 labui:border-t labui:pt-3"
              >
                {attachments}
              </div>
            )}
          </div>
        </article>
      </li>
    );
  },
);

export { EmailIdentity, EmailMessage, EmailThread };
