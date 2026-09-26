import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Badge, Input, useToast } from '../components/common';
import { User, ShieldCheck, Mail, Building } from 'lucide-react';

export default function ProfilePage() {
  const { addToast } = useToast();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || {
    name: 'Operator',
    email: '',
    role: 'warehouse_staff',
  };

  const handleSaveProfile = () => {
    addToast({
      title: 'Profile Updated',
      description: 'Operator preferences and regional scope persisted.',
      variant: 'success',
    });
  };

  const handleChangePassword = () => {
    addToast({
      title: 'Security Link Sent',
      description: 'Password renewal authorization sent to verified device.',
      variant: 'info',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
            Account Preferences
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
          User Profile
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Identity credentials, assigned facilities, and session privileges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 flex flex-col items-center text-center space-y-4 md:col-span-1">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-accent to-[#FFA048] p-1 shadow-accent-glow">
            <div className="w-full h-full rounded-full bg-[#111114] flex items-center justify-center text-2xl font-bold text-white font-display uppercase">
              {user.name ? user.name.slice(0, 2) : 'AV'}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-status-success border-2 border-[#111114]" />
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-white">{user.name}</h3>
            <p className="text-xs text-neutral-400 font-mono">{user.email}</p>
          </div>

          <Badge variant="accent" dot>
            {user.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
          </Badge>

          <div className="w-full pt-4 border-t border-white/[0.06] text-xs space-y-2 text-neutral-400 text-left">
            <div className="flex justify-between">
              <span>Station:</span>
              <span className="text-white font-mono">WH-01 Central</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-400 font-mono">Active</span>
            </div>
          </div>
        </Card>

        {/* Credentials & Details */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="font-display font-bold text-base text-white">Profile Details</h3>
            <p className="text-xs text-neutral-400">Account metadata and assigned scope.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={user.name} readOnly leftIcon={<User className="w-4 h-4" />} />
            <Input label="Email Address" value={user.email} readOnly leftIcon={<Mail className="w-4 h-4" />} />
            <Input label="Access Role" value={user.role === 'inventory_manager' ? 'Inventory Manager' : 'Staff'} readOnly leftIcon={<ShieldCheck className="w-4 h-4" />} />
            <Input label="Assigned Warehouse" value="Central WH-01" readOnly leftIcon={<Building className="w-4 h-4" />} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <Button variant="secondary" size="sm" onClick={handleChangePassword}>
              Change Password
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
