import { useState } from "react";
import { KeyRound, Loader2, Plus, Save, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useUserMutations, useUsersQuery } from "../../hooks/useAdminQueries";
import { useAuth } from "../../Shared/useAuth";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  StatusPill,
  dangerButtonClass,
  fieldClass,
  ghostButtonClass,
  labelClass,
  primaryButtonClass,
} from "./admin-ui";

const EMPTY_CREATE = { name: "", email: "", password: "", role: "Admin" };
const EMPTY_PASSWORD = { password: "", confirm: "" };

const UsersAdmin = () => {
  const { user: currentUser, signOut } = useAuth();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(EMPTY_CREATE);
  const [passwordFor, setPasswordFor] = useState(null);
  const [passwordDraft, setPasswordDraft] = useState(EMPTY_PASSWORD);

  const { status, error, data, refetch } = useUsersQuery();
  const { create, update, remove } = useUserMutations();
  const users = data ?? [];

  const resetMessages = () => {
    setActionError(null);
    setSavedMessage(null);
  };

  // Runs one mutation, keeping the row-level spinner and surfacing the API's
  // own message — including the last-Admin guard, which is a 409. Cache
  // invalidation is the mutation's job, so this does not refetch by hand.
  const run = async (id, work, { onDone } = {}) => {
    setBusyId(id);
    resetMessages();
    try {
      await work();
      await onDone?.();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleRole = (user) => {
    const nextRole = user.role === "Admin" ? "Customer" : "Admin";
    const message =
      nextRole === "Customer"
        ? `Demote ${user.name} to Customer? They will lose access to the staff area.`
        : `Promote ${user.name} to Admin? They will get full staff access.`;
    if (!window.confirm(message)) return;

    return run(user._id, () => update.mutateAsync({ id: user._id, role: nextRole }));
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;

    return run(user._id, () => remove.mutateAsync(user._id), {
      onDone: () => {
        if (passwordFor === user._id) setPasswordFor(null);
      },
    });
  };

  const handlePasswordSave = async (event, user) => {
    event.preventDefault();
    resetMessages();

    const nextPassword = passwordDraft.password;
    if (nextPassword !== passwordDraft.confirm) {
      setActionError(new Error("The two passwords do not match."));
      return;
    }
    if (nextPassword.length < 6) {
      setActionError(new Error("Use at least 6 characters."));
      return;
    }

    const isSelf = String(user._id) === String(currentUser?._id);

    await run(user._id, () => update.mutateAsync({ id: user._id, password: nextPassword }), {
      onDone: () => {
        setPasswordFor(null);
        setPasswordDraft(EMPTY_PASSWORD);
        if (isSelf) {
          // Changing your own password invalidates the token you are holding, so
          // the next request would fail anyway. End the session deliberately.
          signOut();
          return;
        }
        setSavedMessage(`Password updated for ${user.name}.`);
      },
    });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    resetMessages();

    await run("create", () =>
      create.mutateAsync({
        name: createDraft.name.trim(),
        email: createDraft.email.trim(),
        password: createDraft.password,
        role: createDraft.role,
      }),
    {
      onDone: () => {
        setCreateOpen(false);
        setCreateDraft(EMPTY_CREATE);
        setSavedMessage(`Created ${createDraft.email.trim()}.`);
      },
    });
  };

  if (status === "pending") return <AdminLoader label="Loading staff accounts..." />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Access</p>
          <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Staff accounts</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            The staff area is reached directly and is not linked from the storefront. Only
            accounts with the Admin role can sign in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetMessages();
            setCreateOpen((open) => !open);
          }}
          className={primaryButtonClass}
        >
          <Plus className="h-4 w-4" /> New staff account
        </button>
      </header>

      {actionError && (
        <AdminError message={actionError.message || "Something went wrong."} />
      )}
      {savedMessage && (
        <p className="rounded-2xl border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-900">
          {savedMessage}
        </p>
      )}
      {error && !actionError && (
        <AdminError message={error.message || "Could not load staff accounts."} onRetry={refetch} />
      )}

      {createOpen && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        >
          <h2 className="flex items-center gap-2 text-lg font-black text-text">
            <UserRound className="h-5 w-5 text-primary-600" /> New staff account
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={createDraft.name}
                onChange={(e) => setCreateDraft({ ...createDraft, name: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                required
                type="email"
                value={createDraft.email}
                onChange={(e) => setCreateDraft({ ...createDraft, email: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Password</span>
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={createDraft.password}
                onChange={(e) => setCreateDraft({ ...createDraft, password: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Role</span>
              <select
                value={createDraft.role}
                onChange={(e) => setCreateDraft({ ...createDraft, role: e.target.value })}
                className={fieldClass}
              >
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busyId === "create"}
              className={primaryButtonClass}
            >
              {busyId === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Create account
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className={ghostButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          Accounts <span className="text-text-muted">({users.length})</span>
        </h2>

        <div className="mt-4 space-y-3">
          {users.length === 0 ? (
            <AdminEmpty
              title="No accounts yet"
              message="Create a staff account to get into the admin area."
            />
          ) : (
            users.map((user) => {
              const isSelf = String(user._id) === String(currentUser?._id);
              const isOpen = passwordFor === user._id;

              return (
                <div key={user._id} className="rounded-xl bg-surface-soft px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-bold text-text">
                        {user.name}
                        {isSelf && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-900">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusPill value={user.role} />
                      <button
                        type="button"
                        disabled={busyId === user._id}
                        onClick={() => {
                          resetMessages();
                          setPasswordFor(isOpen ? null : user._id);
                          setPasswordDraft(EMPTY_PASSWORD);
                        }}
                        className={ghostButtonClass}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        {isOpen ? "Close" : "Password"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === user._id}
                        onClick={() => handleToggleRole(user)}
                        className={ghostButtonClass}
                      >
                        {user.role === "Admin" ? "Demote" : "Promote"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === user._id}
                        onClick={() => handleDelete(user)}
                        className={dangerButtonClass}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <form
                      onSubmit={(e) => handlePasswordSave(e, user)}
                      className="mt-4 grid gap-3 rounded-xl bg-surface p-4 sm:grid-cols-2"
                    >
                      <label className="block">
                        <span className={labelClass}>New password</span>
                        <input
                          required
                          type="password"
                          minLength={6}
                          autoComplete="new-password"
                          value={passwordDraft.password}
                          onChange={(e) =>
                            setPasswordDraft({ ...passwordDraft, password: e.target.value })
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className={labelClass}>Confirm password</span>
                        <input
                          required
                          type="password"
                          minLength={6}
                          autoComplete="new-password"
                          value={passwordDraft.confirm}
                          onChange={(e) =>
                            setPasswordDraft({ ...passwordDraft, confirm: e.target.value })
                          }
                          className={fieldClass}
                        />
                      </label>
                      <div className="sm:col-span-2">
                        <p className="mb-3 text-xs text-text-muted">
                          {isSelf
                            ? "Changing your own password signs you out of every device."
                            : "The account keeps working, but existing sessions are signed out."}
                        </p>
                        <button
                          type="submit"
                          disabled={busyId === user._id}
                          className={primaryButtonClass}
                        >
                          {busyId === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Update password
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      <p className="text-xs text-text-muted">
        The last remaining Admin cannot be demoted or deleted — the API refuses it, so the
        staff area cannot be locked out by accident.
      </p>
    </div>
  );
};

export default UsersAdmin;
