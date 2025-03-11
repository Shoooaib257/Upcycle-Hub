import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, UploadCloud } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Extend the insert schema with additional validation rules
const productFormSchema = insertProductSchema
  .extend({
    price: z.coerce.number().positive("Price must be positive"),
    imageFile: z
      .instanceof(FileList)
      .refine((files) => files.length > 0, "Main image is required"),
    additionalImageFiles: z
      .instanceof(FileList)
      .optional(),
  })
  .omit({ additionalImages: true, imageUrl: true });

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function CreateProductPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  // Check if user is authenticated and is a seller
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/signin');
          }
          throw new Error('Failed to load user data');
        }
        return res.json();
      }),
  });

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "other",
      featured: false,
      isNew: true,
    },
  });

  // Handle file selection for main image
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      form.setValue("imageFile", files);
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection for additional images
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      form.setValue("additionalImageFiles", files);
      
      const previews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result as string);
          if (previews.length === files.length) {
            setAdditionalImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to create a product listing",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!user.isSeller) {
      toast({
        title: "Seller account required",
        description: "You need a seller account to create product listings",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("sellerId", user.id.toString());
      formData.append("featured", data.featured.toString());
      formData.append("isNew", data.isNew.toString());
      
      // Add main image
      if (data.imageFile && data.imageFile.length > 0) {
        formData.append("imageUrl", data.imageFile[0]);
      }
      
      // Add additional images
      if (data.additionalImageFiles && data.additionalImageFiles.length > 0) {
        Array.from(data.additionalImageFiles).forEach((file) => {
          formData.append("additionalImages", file);
        });
      }

      // Send form data to server
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const product = await response.json();

      toast({
        title: "Product created",
        description: "Your product has been listed successfully",
      });

      // Navigate to product detail page
      navigate(`/products/${product.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, redirect to sign in page
  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not a seller, show error
  if (user && !user.isSeller) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Seller Account Required</AlertTitle>
          <AlertDescription>
            You need a seller account to create product listings. Please contact support to upgrade your account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading font-bold text-3xl mb-2">Create New Listing</h1>
        <p className="text-gray-600 mb-8">Share your upcycled creation with our community of eco-conscious buyers</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Provide detailed information about your upcycled product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Reclaimed Wood Coffee Table" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your product in detail. What materials were used? How was it made? What makes it unique?" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include information about the upcycled materials and the environmental impact.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="home_decor">Home Decor</SelectItem>
                            <SelectItem value="fashion">Fashion</SelectItem>
                            <SelectItem value="jewelry">Jewelry</SelectItem>
                            <SelectItem value="garden">Garden</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mark as New Arrival</FormLabel>
                          <FormDescription>
                            Highlight this as a new product
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Product</FormLabel>
                          <FormDescription>
                            Request this product to be featured
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Main Product Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition hover:border-primary">
                          <input
                            type="file"
                            id="imageFile"
                            className="hidden"
                            accept="image/*"
                            onChange={handleMainImageChange}
                            {...field}
                          />
                          <label htmlFor="imageFile" className="cursor-pointer text-center">
                            {mainImagePreview ? (
                              <div className="space-y-2">
                                <img 
                                  src={mainImagePreview} 
                                  alt="Product preview" 
                                  className="max-h-40 mx-auto object-contain"
                                />
                                <p className="text-sm text-blue-500">Change image</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="text-primary font-medium">Click to upload main image</p>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalImageFiles"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Additional Images (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition hover:border-primary">
                          <input
                            type="file"
                            id="additionalImageFiles"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImagesChange}
                            {...field}
                          />
                          <label htmlFor="additionalImageFiles" className="cursor-pointer text-center">
                            {additionalImagePreviews.length > 0 ? (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {additionalImagePreviews.map((preview, index) => (
                                    <img 
                                      key={index}
                                      src={preview} 
                                      alt={`Additional image ${index + 1}`} 
                                      className="h-20 w-20 object-cover rounded"
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-blue-500">Add/change images</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="text-primary font-medium">Click to upload additional images</p>
                                <p className="text-xs text-gray-500">Up to 5 additional images</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Additional images help buyers see your product from different angles.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-primary text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Product Listing"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
