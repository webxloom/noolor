type InviteUserProps = {
  username: string;
  role?: string;
  path: string;
};

export function inviteUserTemplate({
  username,
  role = "Writer",
  path,
}: InviteUserProps) {
  const capitalizedRole =
    role && role.length > 0
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "Writer";

  const subject = `You've been invited to join Noolor as a ${capitalizedRole}`;

  const text = `Hello ${username}\n\nYou have been invited to join Noolor as a ${capitalizedRole}.\n\nComplete your registration using the link below.\n\n${path}`;

  const html = `<!doctype html>
	<html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>${subject}</title>
		</head>
		<body style="font-family: Arial, Helvetica, sans-serif; line-height:1.5; color:#111;">
			<p>Hello ${username},</p>
			<p>You have been invited to join <strong>Noolor</strong> as a <strong>${capitalizedRole}</strong>.</p>
			<p>Complete your registration using the link below.</p>
			<p><a href="${path}" style="color:#0969da;">${path}</a></p>
			<p>Thanks,<br/>Team Noolor</p>
		</body>
	</html>`;

  return { subject, text, html };
}

export default inviteUserTemplate;
