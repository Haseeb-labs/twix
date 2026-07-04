export default function UserAvatar({ user, size = 40 }) {
  const initials = user?.username?.[0]?.toUpperCase() || '?';
  const style = { width: size, height: size };

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        style={style}
        className="rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div
      style={style}
      className="rounded-full bg-twitter flex items-center justify-center text-white font-bold shrink-0 select-none"
    >
      {initials}
    </div>
  );
}
