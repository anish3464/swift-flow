import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, CompanyRegistrationData } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<CompanyRegistrationData>({
    name: '',
    company_type: 'company',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    owner_username: '',
    owner_email: '',
    owner_password: '',
    owner_password_confirm: '',
    owner_first_name: '',
    owner_last_name: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.owner_password !== formData.owner_password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authService.register(formData);
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.non_field_errors?.[0] ||
                          Object.values(err.response?.data || {}).flat().join(', ') ||
                          'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CompanyRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Register Company</CardTitle>
          <CardDescription className="text-center">
            Create an account for your company or register as a freelancer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-type">Type *</Label>
                  <Select value={formData.company_type} onValueChange={(value) => updateField('company_type', value as 'company' | 'freelancer')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email *</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    placeholder="company@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of your company"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Company address"
                  />
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Owner Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-username">Username *</Label>
                  <Input
                    id="owner-username"
                    value={formData.owner_username}
                    onChange={(e) => updateField('owner_username', e.target.value)}
                    required
                    placeholder="Choose a username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner-email">Email *</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => updateField('owner_email', e.target.value)}
                    required
                    placeholder="owner@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={formData.owner_first_name}
                    onChange={(e) => updateField('owner_first_name', e.target.value)}
                    placeholder="First name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={formData.owner_last_name}
                    onChange={(e) => updateField('owner_last_name', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.owner_password}
                    onChange={(e) => updateField('owner_password', e.target.value)}
                    required
                    placeholder="Choose a strong password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-confirm">Confirm Password *</Label>
                  <Input
                    id="password-confirm"
                    type="password"
                    value={formData.owner_password_confirm}
                    onChange={(e) => updateField('owner_password_confirm', e.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;