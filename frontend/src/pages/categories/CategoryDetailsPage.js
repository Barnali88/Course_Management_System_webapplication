import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGetCategories } from '../../api/categoriesApi';
import { apiGetCourses } from '../../api/coursesApi';
import { getImageUrl } from '../../api/axiosInstance';
import PageHeader from '../../components/common/PageHeader';

const CategoryDetailsPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    Promise.all([apiGetCategories(), apiGetCourses()]).then(([categories, allCourses]) => {
      const found = categories.find((item) => String(item.id) === String(categoryId));
      setCategory(found || null);
      setCourses(allCourses.filter((course) => String(course.category_id) === String(categoryId)));
    });
  }, [categoryId]);

  if (!category) return <div className="card p-8">Category not found.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={category.name} subtitle="Detailed category view with linked courses." action={<Link to="/categories" className="btn-secondary !rounded-2xl">Back</Link>} />
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.04]">
          <div className="h-72 bg-white/5">{getImageUrl(category.image) ? <img src={getImageUrl(category.image)} alt={category.name} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-slate-500">No category image uploaded</div>}</div>
          <div className="p-6">
            <h2 className="text-2xl font-display font-bold text-white">{category.name}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{category.description || 'No description available.'}</p>
          </div>
        </div>
        <div className="card p-6 rounded-[28px] bg-white/[0.04] border-white/10">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-4">Linked courses</p>
          <div className="space-y-3">
            {courses.length === 0 && <p className="text-sm text-slate-400">No courses linked to this category yet.</p>}
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="block rounded-2xl border border-white/8 bg-white/5 p-4 hover:bg-white/10 transition">
                <p className="text-sm font-semibold text-white">{course.title}</p>
                <p className="mt-1 text-xs text-slate-400">{course.description || 'No description yet.'}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsPage;
